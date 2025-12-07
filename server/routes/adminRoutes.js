const express = require('express');
const ProviderAuth = require('../modules/provider/auth');
const TenantProvisioning = require('../modules/provider/provisioning');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Provider Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await ProviderAuth.login(email, password);
        if (!result) return res.status(401).json({ message: 'Invalid credentials' });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected Routes
router.use(authMiddleware);

// Create Tenant
router.post('/tenants', async (req, res) => {
    if (req.user.role !== 'provider_admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const { name, rootEmail, rootPassword } = req.body;
        if (!name || !rootEmail || !rootPassword) return res.status(400).json({ message: 'Missing fields' });

        const result = await TenantProvisioning.createTenant({ name, rootEmail, rootPassword });
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Provisioning failed' });
    }
});

// Generate Support Token
router.post('/support-access', async (req, res) => {
    if (req.user.role !== 'provider_admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const { tenantId, durationMinutes } = req.body;
        if (!tenantId) return res.status(400).json({ message: 'Missing tenantId' });

        const result = await ProviderAuth.generateSupportToken(req.user.id, tenantId, durationMinutes);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate token' });
    }
});

module.exports = router;
