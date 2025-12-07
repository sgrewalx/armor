const { query } = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class ProviderAuth {
    static async login(email, password) {
        const res = await query(
            `SELECT * FROM provider_admins WHERE email = $1`,
            [email]
        );

        const admin = res.rows[0];
        if (!admin) return null;

        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) return null;

        const token = jwt.sign(
            {
                sub: admin.id,
                role: 'provider_admin',
                type: 'provider',
                jti: uuidv4()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token };
    }

    static async generateSupportToken(providerId, tenantId, durationMinutes = 60) {
        // Validate Tenant Exists
        const tenantRes = await query(`SELECT id FROM tenants WHERE id = $1`, [tenantId]);
        if (tenantRes.rows.length === 0) throw new Error("Tenant not found");

        const token = jwt.sign(
            {
                sub: providerId,
                role: 'provider_support',
                type: 'support',
                tenant_id: tenantId,
                jti: uuidv4()
            },
            process.env.JWT_SECRET,
            { expiresIn: `${durationMinutes}m` }
        );

        return { token, expiresIn: durationMinutes * 60 };
    }
}

module.exports = ProviderAuth;
