const express = require('express');
const router = express.Router();

const saleController = require('../controllers/sale.controller');

router.post('/', async (req, res, next) => {
    await saleController.saveSale(req, res, next);
});

router.get('/bill-number', async (req, res, next) => {
    await saleController.getNextBillNumber(req, res, next)
});

router.get('/all', async (req, res, next) => {
    await saleController.getSales(req, res, next)
});

router.get('/sale-details', async (req, res, next) => {
    await saleController.getSaleDetails(req, res, next)
});

router.get('/gst-details', async (req, res, next) => {
    await saleController.getGstDetailsOfSale(req, res, next)
});

module.exports = router;