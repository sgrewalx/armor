const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Provider Admin Routes (Public Schema)
app.use('/armor-admin', adminRoutes);

// Tenant Auth Routes (Dynamic Schema)
app.use('/auth', authRoutes);

// Protected Identity Verification Route
app.get('/api/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Identity Verified',
        user: req.user,
        tenantId: req.tenantId
    });
});

app.get('/', (req, res) => {
    res.send('Armor API Running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
