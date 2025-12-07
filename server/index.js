const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Provider Admin Routes (Public Schema)
app.use('/armor-admin', adminRoutes);

// 2. Tenant Auth Routes (Public Schema lookup -> Tenant Context)
app.use('/auth', authRoutes);

// 3. Protected Tenant API (Assets, Findings, etc.)
app.use('/api', apiRoutes);

// 4. Me Endpoint
app.get('/api/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Identity Verified',
        user: req.user,
        tenantId: req.tenantId
    });
});

app.get('/', (req, res) => {
    res.send('Armor API Running (Raw SQL)');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
