const express = require('express');
const router = express.Router();
const { startScan, getScans, getScanResults } = require('../controllers/scanController');

router.post('/', startScan);
router.get('/', getScans);
router.get('/:id/results', getScanResults);

module.exports = router;
