const prisma = require('./index');

/**
 * Run a callback within a Tenant's schema context.
 * Uses a Prisma Interactive Transaction to ensure `SET search_path` applies to the queries.
 * 
 * @param {string} tenantId - UUID of the tenant
 * @param {function(Prisma.TransactionClient): Promise<T>} callback 
 * @returns {Promise<T>}
 */
const runWithTenant = async (tenantId, callback) => {
    if (!tenantId) {
        throw new Error('Tenant ID is required for context switching.');
    }

    // 1. Resolve Schema Name
    const tenant = await prisma.tenantMetadata.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) {
        throw new Error(`Tenant '${tenantId}' not found.`);
    }

    // Schema Name is strictly stored in metadata
    const schemaName = tenant.schemaName;

    // 2. Execute Transaction
    return prisma.$transaction(async (tx) => {
        // Set search path for this transaction
        // "public" is added for access to shared extensions/tables if needed.
        await tx.$executeRawUnsafe(`SET search_path TO "${schemaName}", public`);

        return callback(tx);
    });
};

module.exports = { runWithTenant };
