const { query } = require('../../../db');
const { getTenantPrisma } = require('../../../db/tenantPrisma');
const { assumeAwsRole } = require('./auth.ts');
const { collectEc2Instances } = require('./ec2.ts');
const { normalizeEc2Instances } = require('./normalize.ts');

function parseMetadata(raw) {
    if (!raw) return {};
    if (typeof raw === 'object' && !Buffer.isBuffer(raw)) return raw;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn('[AWS][EC2] Failed to parse cloud account metadata JSON', err);
        return {};
    }
}

async function resolveSchemaName(tenantId) {
    const res = await query(`SELECT schema_name FROM tenants WHERE id = $1`, [tenantId]);
    if (!res.rows.length) {
        throw new Error(`Tenant ${tenantId} not found`);
    }
    return res.rows[0].schema_name;
}

function deriveRegions(accountRow) {
    const regions = [];
    const metadata = parseMetadata(accountRow.metadata);

    if (metadata.regions && Array.isArray(metadata.regions)) {
        regions.push(...metadata.regions);
    }
    if (accountRow.region) {
        regions.push(accountRow.region);
    }
    return Array.from(new Set(regions.filter(Boolean)));
}

const cloudAccountTableCache = new Map();

async function getCloudAccountTableInfo(prisma) {
    const schemaRes = await prisma.$queryRawUnsafe('SELECT current_schema() AS schema');
    const schemaName = schemaRes?.[0]?.schema;
    if (schemaName && cloudAccountTableCache.has(schemaName)) {
        return cloudAccountTableCache.get(schemaName);
    }

    const tableRow = await prisma.$queryRawUnsafe(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'cloud_accounts' LIMIT 1`
    );
    if (!tableRow.length) {
        throw new Error('No cloud_accounts table found in tenant schema');
    }
    const tableName = tableRow[0].table_name;

    const columnRows = await prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1`,
        tableName
    );
    const columns = new Set(columnRows.map(r => r.column_name));
    const info = { tableName, columns };

    if (schemaName) {
        cloudAccountTableCache.set(schemaName, info);
    }
    return info;
}

async function fetchAwsAccount(prisma) {
    const { tableName, columns } = await getCloudAccountTableInfo(prisma);
    const requiredColumns = ['provider', 'role_arn', 'external_id', 'id'];
    for (const col of requiredColumns) {
        if (!columns.has(col)) {
            throw new Error(`cloud_accounts table "${tableName}" is missing required column "${col}"`);
        }
    }

    const selectedColumns = ['id', 'role_arn', 'external_id'];
    if (columns.has('metadata')) selectedColumns.push('metadata');
    if (columns.has('region')) selectedColumns.push('region');

    const selectSql = `SELECT ${selectedColumns.map(c => `"${c}"`).join(', ')} FROM "${tableName}" WHERE lower(provider) = 'aws' LIMIT 1`;
    const accounts = await prisma.$queryRawUnsafe(selectSql);
    const account = accounts[0];
    if (!account) return null;

    const metadata = columns.has('metadata') ? parseMetadata(account.metadata) : {};

    return { ...account, metadata };
}

const assetTableCache = new Map();

async function getAssetTableInfo(prisma) {
    // Cache per schema to avoid repeated catalog lookups
    const schemaRes = await prisma.$queryRawUnsafe('SELECT current_schema() AS schema');
    const schemaName = schemaRes?.[0]?.schema;
    if (schemaName && assetTableCache.has(schemaName)) {
        return assetTableCache.get(schemaName);
    }

    const tableRow = await prisma.$queryRawUnsafe(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('assets', 'cloud_assets') ORDER BY table_name LIMIT 1`
    );
    if (!tableRow.length) {
        throw new Error('No assets table found in tenant schema');
    }
    const tableName = tableRow[0].table_name;

    const columnRows = await prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1`,
        tableName
    );
    const columns = new Set(columnRows.map(r => r.column_name));
    const info = { tableName, columns };

    if (schemaName) {
        assetTableCache.set(schemaName, info);
    }
    return info;
}

async function upsertAssets(prisma, cloudAccountId, assets) {
    const { tableName, columns } = await getAssetTableInfo(prisma);
    const hasMetadataColumn = columns.has('metadata');
    const hasTagsColumn = columns.has('tags');
    const hasCloudAccountColumn = columns.has('cloud_account_id');
    const hasNativeIdColumn = columns.has('native_id');

    if (!hasNativeIdColumn) {
        throw new Error(`Assets table "${tableName}" is missing required column "native_id"`);
    }

    for (const asset of assets) {
        const tags = {
            cloud_provider: asset.cloud_provider,
            asset_type: asset.asset_type,
            public_ip: asset.public_ip,
            private_ip: asset.private_ip,
            vpc_id: asset.vpc_id,
            subnet_id: asset.subnet_id,
            security_groups: asset.security_groups,
            state: asset.state,
        };

        const selectSql = `SELECT id FROM "${tableName}" WHERE native_id = $1 AND region = $2 AND type = $3 LIMIT 1`;
        const existing = await prisma.$queryRawUnsafe(selectSql, asset.resource_id, asset.region, asset.asset_type);

        if (existing.length) {
            const updateColumns = ['name = $1'];
            const params = [asset.name];
            let idx = 2;

            if (hasTagsColumn) {
                updateColumns.push(`tags = $${idx++}`);
                params.push(tags);
            }
            if (hasMetadataColumn) {
                updateColumns.push(`metadata = $${idx++}`);
                params.push(asset.metadata);
            }
            if (hasCloudAccountColumn) {
                updateColumns.push(`cloud_account_id = $${idx++}`);
                params.push(cloudAccountId);
            }

            params.push(asset.resource_id, asset.region, asset.asset_type, existing[0].id);
            const updateSql = `UPDATE "${tableName}" SET ${updateColumns.join(', ')} WHERE native_id = $${idx++} AND region = $${idx++} AND type = $${idx++} AND id = $${idx}`;
            await prisma.$executeRawUnsafe(updateSql, ...params);
        } else {
            const insertColumns = ['name', 'type', 'region', 'native_id'];
            const values = [asset.name, asset.asset_type, asset.region, asset.resource_id];

            if (hasCloudAccountColumn) {
                insertColumns.unshift('cloud_account_id');
                values.unshift(cloudAccountId);
            }
            if (hasTagsColumn) {
                insertColumns.push('tags');
                values.push(tags);
            }
            if (hasMetadataColumn) {
                insertColumns.push('metadata');
                values.push(asset.metadata);
            }

            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const insertSql = `INSERT INTO "${tableName}" (${insertColumns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
            await prisma.$executeRawUnsafe(insertSql, ...values);
        }
    }
}

async function scanEc2ForTenant(req, res) {
    try {
        const schemaName = req.user.schemaName || await resolveSchemaName(req.tenantId);
        const prisma = getTenantPrisma(schemaName);

        console.log(`[AWS][EC2] Starting scan for tenant schema ${schemaName}`);

        const account = await fetchAwsAccount(prisma);
        if (!account) {
            return res.status(400).json({ message: 'No AWS cloud account configured for tenant' });
        }
        if (!account.role_arn) {
            return res.status(400).json({ message: 'AWS cloud account is missing role ARN' });
        }
        if (!account.external_id) {
            return res.status(400).json({ message: 'AWS cloud account is missing external ID' });
        }

        const regions = deriveRegions(account);
        if (!regions.length) {
            return res.status(400).json({ message: 'AWS cloud account does not have any regions configured' });
        }

        const credentials = await assumeAwsRole(account.role_arn, account.external_id);
        const summary = {};

        for (const region of regions) {
            console.log(`[AWS][EC2] Scanning region ${region}...`);
            try {
                const instances = await collectEc2Instances(credentials, region);
                const normalized = normalizeEc2Instances(instances, region);
                await upsertAssets(prisma, account.id, normalized);
                summary[region] = normalized.length;
                console.log(`[AWS][EC2] Region ${region}: ${normalized.length} instances discovered.`);
            } catch (regionErr) {
                console.error(`[AWS][EC2] Failed region ${region}`, regionErr);
                summary[region] = 0;
            }
        }

        console.log(`[AWS][EC2] Scan completed for tenant schema ${schemaName}`);
        return res.json({ summary });
    } catch (err) {
        console.error('[AWS][EC2] Scan failed', err);
        return res.status(500).json({ message: 'EC2 scan failed', error: err.message });
    }
}

module.exports = {
    scanEc2ForTenant,
};
