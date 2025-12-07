const prisma = require('../db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const TENANT_TEMPLATE_PATH = path.join(__dirname, '../sql/tenant_template.sql');

class SchemaService {
    /**
     * Sanitizes and validates the schema name.
     * MUST be of format t_<hex>
     */
    static getSanitizedSchemaName(uuid) {
        // Remove dashes to get hex string
        const hex = uuid.replace(/-/g, '');
        return `t_${hex}`;
    }

    /**
     * Create a new Tenant with dedicated schema.
     * @param {string} name - Tenant Name
     * @param {string} adminEmail - Root User Email
     * @param {string} adminPassword - Root User Password
     */
    static async createTenant(name, adminEmail, adminPassword) {
        const tenantId = uuidv4();
        const schemaName = this.getSanitizedSchemaName(tenantId);
        const hexId = tenantId.replace(/-/g, ''); // Store hex ID for metadata consistency

        console.log(`[SchemaService] Creating tenant '${name}' with schema '${schemaName}'...`);

        try {
            // 1. Transaction: Create Metadata & Schema
            await prisma.$transaction(async (tx) => {
                // Create Tenant Metadata in public schema
                await tx.tenantMetadata.create({
                    data: {
                        id: tenantId,
                        hexId: hexId,
                        schemaName: schemaName,
                        name: name,
                        status: 'ACTIVE'
                    }
                });

                // Create Schema (Strictly sanitized name)
                await tx.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`);
                console.log(`[SchemaService] Schema '${schemaName}' created.`);
            });

            // 2. Populate Schema with Tables
            const sqlContent = fs.readFileSync(TENANT_TEMPLATE_PATH, 'utf-8');
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                // Set context and execute
                await prisma.$executeRawUnsafe(`SET search_path TO "${schemaName}"; ${statement}`);
            }
            console.log(`[SchemaService] Tables created in '${schemaName}'.`);

            // 3. Create Root User
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const userId = uuidv4();
            // Using parameterized query for values, but setting schema via search_path first
            await prisma.$executeRawUnsafe(`
                SET search_path TO "${schemaName}";
                INSERT INTO "users" (id, email, password_hash, role, created_at)
                VALUES ($1, $2, $3, 'root', NOW());
            `, userId, adminEmail, hashedPassword);

            console.log(`[SchemaService] Root user created for '${name}'.`);

            return { tenantId, schemaName, name };

        } catch (error) {
            console.error('[SchemaService] Error creating tenant:', error);
            // In a real sys, we might want to attempt schema drop if it failed partially
            throw error;
        }
    }
}

module.exports = SchemaService;
