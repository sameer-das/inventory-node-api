const express = require('express');
const router = express.Router();

const reportsController = require('../controllers/reports.controller');

router.get('/current-stock-brand', async (req, res, next) => {
    await reportsController.brandWiseStockDetails(req, res, next);
});

router.get('/sale-report', async (req, res, next) => {
    await reportsController.saleReport(req, res, next);
});

router.get('/profit-report', async (req, res, next) => {
    await reportsController.profitReport(req, res, next);
});

module.exports = router;