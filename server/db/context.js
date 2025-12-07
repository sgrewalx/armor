const { pool } = require('./index');

/**
 * Runs a callback with a tenant-scoped database client.
 * Handles checkout, `SET search_path`, execution, and release.
 * 
 * @param {string|object} tenantContext - Can be tenantId (string) or object { schemaName }. 
 *                                        If string, we lookup. If object, strictly use schemaName.
 * @param {function(Client): Promise<T>} callback
 * @returns {Promise<T>}
 */
async function runWithTenant(tenantContext, callback) {
    const client = await pool.connect();
    try {
        let schemaName;

        if (typeof tenantContext === 'string') {
            // Lookup schema by ID
            const res = await client.query(`SELECT schema_name FROM tenants WHERE id = $1`, [tenantContext]);
            if (res.rows.length === 0) throw new Error(`Tenant ${tenantContext} not found`);
            schemaName = res.rows[0].schema_name;
        } else if (tenantContext && tenantContext.schemaName) {
            schemaName = tenantContext.schemaName;
        } else {
            throw new Error("Invalid tenant context provided");
        }

        // Set Search Path
        // We include 'public' for shared extensions if needed, but primary is strict.
        await client.query(`SET search_path TO "${schemaName}", public`);

        return await callback(client);

    } finally {
        client.release();
    }
}

module.exports = { runWithTenant };
