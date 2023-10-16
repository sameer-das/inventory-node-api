const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchase.controller');


router.post('/', async (req, res, next) => {
    const resp = await purchaseController.addPurchase(req.body);
    res.status(resp.status).json(resp);
});



module.exports = router;