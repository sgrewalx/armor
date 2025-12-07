const express = require('express');
const TenantAuth = require('../modules/tenant/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { tenantId, email, password } = req.body;
        if (!tenantId || !email || !password) return res.status(400).json({ message: 'Missing fields' });

        const result = await TenantAuth.login(tenantId, email, password);
        if (!result) return res.status(401).json({ message: 'Invalid credentials' });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

module.exports = router;
