const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchase.controller');


router.post('/', async (req, res, next) => {
    const resp = await purchaseController.addPurchase(req.body);
    res.status(resp.status).json(resp);
});

router.get('/', async (req, res, next) => {
    await purchaseController.getAllPurchases(req,res,next);
});

router.get('/details', async (req, res, next) => {
    await purchaseController.getPurchaseDetails(req,res,next);
});



module.exports = router;