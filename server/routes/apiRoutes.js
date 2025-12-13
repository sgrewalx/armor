const express = require('express');
const AssetsController = require('../modules/assets/controller');
const FindingsController = require('../modules/findings/controller');
const CloudAccountsController = require('../modules/cloudAccounts/controller');
const { scanEc2ForTenant } = require('../modules/cloud/aws/ec2Scan');
const authMiddleware = require('../middleware/authMiddleware');
const { checkIAM } = require('../middleware/iamMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Assets
router.get('/assets', checkIAM('assets.read'), AssetsController.list);
router.post('/assets', checkIAM('assets.write'), AssetsController.create);

// Cloud Accounts
router.get('/cloud-accounts', checkIAM('cloud_accounts.read'), CloudAccountsController.list);
router.post('/cloud-accounts', checkIAM('cloud_accounts.write'), CloudAccountsController.create);

// Findings
router.get('/findings', checkIAM('findings.read'), FindingsController.list);

// Manual AWS EC2 Scan
router.post('/scans/aws/ec2', checkIAM('assets.write'), scanEc2ForTenant);

module.exports = router;
