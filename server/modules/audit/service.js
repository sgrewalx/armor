const { pool, query } = require('../../db');
const { runWithTenant } = require('../../db/context');

class AuditService {
    /**
     * Log an action (Actor, Action, Target, Details).
     * Automatically attempts to determine context.
     * @param {object} params
     * @param {string} params.action - e.g. TENANT_CREATED, USER_LOGIN
     * @param {string} params.target - e.g. Tenant ID, User IP
     * @param {object} params.details - JSON serializable object
     * @param {object} req - Express Request object (to extract actor/context)
     */
    static async log(params, req) {
        const { action, target, details } = params;
        const user = req.user || {};
        const tenantId = req.tenantId;

        // 1. Provider Context? (No tenantId or explicitly public)
        if (!tenantId) {
            await query(
                `INSERT INTO audit_logs (actor_id, actor_type, action, target, details) VALUES ($1, $2, $3, $4, $5)`,
                [user.id || 'system', user.role || 'system', action, target, JSON.stringify(details)]
            );
            return;
        }

        // 2. Tenant Context
        // Use runWithTenant to insert into t_<hex>.audit_logs
        // We assume req.user.schemaName is available if Auth middleware ran, 
        // or we pass tenantId to lookup.
        const context = req.user?.schemaName ? { schemaName: req.user.schemaName } : tenantId;

        await runWithTenant(context, async (client) => {
            await client.query(
                `INSERT INTO audit_logs (actor_id, actor_role, action, target, details) VALUES ($1, $2, $3, $4, $5)`,
                [user.id || 'unknown', user.role || 'unknown', action, target, JSON.stringify(details)]
            );
        });
    }
}

module.exports = AuditService;
