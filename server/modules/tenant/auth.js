const { pool } = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class TenantAuth {
    static async login(tenantId, email, password) {
        const client = await pool.connect();
        try {
            // 1. Resolve Schema
            const tenantRes = await client.query(
                `SELECT schema_name, hex_id FROM tenants WHERE id = $1`,
                [tenantId]
            );
            if (tenantRes.rows.length === 0) return null; // Tenant not found
            const { schema_name } = tenantRes.rows[0];

            // 2. Switch Context
            await client.query(`SET search_path TO "${schema_name}"`);

            // 3. Find User
            const userRes = await client.query(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );
            const user = userRes.rows[0];
            if (!user) return null;

            // 4. Verify Password
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return null;

            // 5. Parse Permissions
            // Root user gets ALL permissions (wildcard)
            let allowedFeatures = [];
            if (user.role === 'root') {
                allowedFeatures = ['*'];
            } else {
                allowedFeatures = user.iam_policy?.allowed_features || [];
            }

            // 6. Generate Token
            const token = jwt.sign(
                {
                    sub: user.id,
                    role: user.role, // 'root', 'sub_user'
                    type: 'tenant',
                    tenant_id: tenantId,
                    allowed_features: allowedFeatures,
                    schema_name: schema_name,
                    jti: uuidv4()
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return { token, user: { id: user.id, email: user.email, role: user.role } };

        } finally {
            client.release();
        }
    }
}

module.exports = TenantAuth;
