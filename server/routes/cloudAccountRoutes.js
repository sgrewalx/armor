const express = require('express');
const router = express.Router();
const { addCloudAccount, getCloudAccounts } = require('../controllers/cloudAccountController');

router.post('/', addCloudAccount);
router.get('/', getCloudAccounts);

module.exports = router;
