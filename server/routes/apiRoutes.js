const express = require('express');
const AssetsController = require('../modules/assets/controller');
const FindingsController = require('../modules/findings/controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkIAM } = require('../middleware/iamMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Assets
router.get('/assets', checkIAM('assets.read'), AssetsController.list);
router.post('/assets', checkIAM('assets.write'), AssetsController.create);

// Findings
router.get('/findings', checkIAM('findings.read'), FindingsController.list);

module.exports = router;
