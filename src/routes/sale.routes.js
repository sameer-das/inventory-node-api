const express = require('express');
const router = express.Router();

const saleController = require('../controllers/sale.controller');

router.post('/', async (req, res, next) => {
    try {
        const result = await saleController.saveSale(req.body);
        res.status(200).json({ status: 200, message: null, result: result })
    } catch(e) {
        res.status(500).json({ status: 500, message: e.message, result: null })

    }
});

module.exports = router;