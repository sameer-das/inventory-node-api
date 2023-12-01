const express = require('express');
const router = express.Router();

const reportsController = require('../controllers/reports.controller');

router.get('/current-stock-brand', async (req, res, next) => {
    await reportsController.brandWiseStockDetails(req, res, next);
});

module.exports = router;