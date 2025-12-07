const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { runWithTenant } = require('../db/context');

const router = express.Router();

// Tenant User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, tenantId } = req.body;

        if (!email || !password || !tenantId) {
            return res.status(400).json({ message: 'Email, password, and tenantId are required' });
        }

        // Run in Tenant Context
        const result = await runWithTenant(tenantId, async (tx) => {
            // "users" table in tenant schema
            const user = await tx.user.findUnique({ where: { email } });

            if (!user) return null;

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return null;

            return user;
        });

        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: result.id,
                tenantId: tenantId,
                role: result.role,
                jti: uuidv4()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: result.id, email: result.email, role: result.role } });

    } catch (error) {
        console.error('Tenant Login Error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

module.exports = router;
