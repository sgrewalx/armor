const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { runWithTenant } = require('../db/context');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 0. Check Revocation
        if (decoded.jti) {
            const revokedRes = await query(`SELECT 1 FROM revoked_tokens WHERE jti = $1`, [decoded.jti]);
            if (revokedRes.rows.length > 0) {
                return res.status(401).json({ message: 'Token has been revoked' });
            }
        }

        // 1. Provider Admin
        if (decoded.role === 'provider_admin') {
            const adminRes = await query(`SELECT * FROM provider_admins WHERE id = $1`, [decoded.sub]);
            const admin = adminRes.rows[0];

            if (!admin) return res.status(401).json({ message: 'Invalid token' });

            req.user = { ...admin, role: 'provider_admin', type: 'provider' };
            req.tenantId = null;
            return next();
        }

        // 2. Tenant Context
        if (decoded.tenant_id) {
            req.tenantId = decoded.tenant_id;

            // 2a. Provider Support (Read-Only)
            if (decoded.role === 'provider_support') {
                req.user = {
                    id: decoded.sub,
                    role: 'provider_support',
                    type: 'support',
                    tenantId: decoded.tenant_id
                };
                return next();
            }

            // 2b. Tenant User (Root/Sub)
            // Need schema name from token (optimization) or lookup
            const schemaName = decoded.schema_name;
            const tenantContext = schemaName ? { schemaName } : decoded.tenant_id;

            await runWithTenant(tenantContext, async (client) => {
                const userRes = await client.query(`SELECT * FROM users WHERE id = $1`, [decoded.sub]);
                const user = userRes.rows[0];
                if (!user) throw new Error("User not found in tenant");

                req.user = {
                    ...user,
                    role: user.role, // 'root' or 'sub_user'
                    iam_policy: user.iam_policy,
                    tenantId: decoded.tenant_id,
                    schemaName: schemaName
                };
            });
            return next();
        }

        return res.status(401).json({ message: 'Invalid token structure' });

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
