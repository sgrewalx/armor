const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // for JTI
const prisma = require('../db');
const SchemaService = require('../services/schemaService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Provider Admin Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find Provider Admin
        const admin = await prisma.providerAdmin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: admin.id,
                role: 'provider_admin',
                jti: uuidv4()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware for protected admin routes
router.use(authMiddleware);

// Create Tenant
router.post('/tenants', async (req, res) => {
    // Only Provider Admins
    if (req.user.role !== 'provider_admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { name, rootEmail, rootPassword } = req.body;
        // Validation...

        const result = await SchemaService.createTenant(name, rootEmail, rootPassword);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create tenant' });
    }
});

// Generate Support Access Token (Read-Only)
router.post('/support-access', async (req, res) => {
    if (req.user.role !== 'provider_admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { tenantId, durationMinutes = 60 } = req.body;

    // Validate existence
    const tenant = await prisma.tenantMetadata.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const token = jwt.sign(
        {
            userId: req.user.id, // Support User ID = Provider Admin ID
            role: 'provider_support',
            tenantId: tenantId,
            jti: uuidv4()
        },
        process.env.JWT_SECRET,
        { expiresIn: `${durationMinutes}m` }
    );

    res.json({ token, expires_in: durationMinutes * 60 });
});

module.exports = router;
