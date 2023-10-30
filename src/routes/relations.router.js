const express = require('express');
const router = express.Router();

const relationsController = require('../controllers/relations.controller');

router.post('/biller', async (req, res, next) => {
    await relationsController.addBiller(req, res, next);
});
router.post('/customer', async (req, res, next) => {
    await relationsController.addCustomer(req, res, next);
});
router.get('/biller', async (req, res, next) => {
    await relationsController.getBiller(req, res, next);
});
router.get('/customer', async (req, res, next) => {
    await relationsController.getCustomer(req, res, next);
});


module.exports = router;