const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

const tenantClients = new Map();

function buildTenantDatabaseUrl(schemaName) {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not configured');
    }
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbUrl.searchParams.set('schema', schemaName);
    return dbUrl.toString();
}

function getTenantPrisma(schemaName) {
    if (!schemaName) {
        throw new Error('schemaName is required for tenant Prisma client');
    }

    if (tenantClients.has(schemaName)) {
        return tenantClients.get(schemaName);
    }

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: buildTenantDatabaseUrl(schemaName)
            }
        }
    });

    tenantClients.set(schemaName, prisma);
    return prisma;
}

module.exports = {
    getTenantPrisma,
};
