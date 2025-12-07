const { pool, query } = require('../../db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const TEMPLATE_PATH = path.join(__dirname, '../../migrations/001_tenant_template.sql');

class TenantProvisioning {

    static async createTenant({ name, rootEmail, rootPassword }) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            console.log(`[Provisioning] Creating tenant: ${name}`);

            // 1. Generate IDs
            const hexId = uuidv4().replace(/-/g, '');
            const schemaName = `t_${hexId}`;
            const tenantId = uuidv4();

            // 2. Insert into public.tenants
            await client.query(
                `INSERT INTO tenants (id, name, hex_id, schema_name) VALUES ($1, $2, $3, $4)`,
                [tenantId, name, hexId, schemaName]
            );

            // 3. Create Schema
            // Note: Schema name cannot be parameterized in CREATE SCHEMA.
            // We trust our hex generation to be safe, but validation is good.
            if (!/^[a-z0-9_]+$/.test(schemaName)) throw new Error("Invalid schema name");

            await client.query(`CREATE SCHEMA "${schemaName}"`);

            // 4. Apply Tenant Template
            const sqlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
            // Basic split by semicolon. Robust parsers are better but this suffices for controlled templates.
            const statements = sqlTemplate
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const stmt of statements) {
                // Set path and execute
                // We use search_path to avoid modifying the SQL template
                await client.query(`SET search_path TO "${schemaName}"`);
                await client.query(stmt);
            }

            // 5. Create Root User
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(rootPassword, salt);
            const userId = uuidv4();

            await client.query(`SET search_path TO "${schemaName}"`);
            await client.query(
                `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, 'root')`,
                [userId, rootEmail, hash]
            );

            // 6. Audit Log (Provider Level)
            await client.query(`SET search_path TO "public"`);
            await client.query(
                `INSERT INTO audit_logs (action, target, details) VALUES ($1, $2, $3)`,
                ['TENANT_CREATED', tenantId, JSON.stringify({ name, schemaName })]
            );

            await client.query('COMMIT');
            console.log(`[Provisioning] Tenant ${name} created successfully.`);

            return {
                tenantId,
                schemaName,
                rootEmail
            };

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('[Provisioning] Failed:', err);
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = TenantProvisioning;
