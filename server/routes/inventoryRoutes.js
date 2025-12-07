const express = require('express');
const router = express.Router();
const { getAssets, addAsset, deleteAsset, syncAssets } = require('../controllers/inventoryController');

// TODO: Add middleware to check if user is authenticated
router.post('/sync', syncAssets);
router.get('/', getAssets);
router.post('/', addAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
