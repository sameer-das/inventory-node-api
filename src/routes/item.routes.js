const express = require('express');
const router = express.Router();

const itemController = require('../controllers/item.controller');

router.get('/', (req, res, next) => {
    itemController.getAllItems(req, res, next)
});

router.post('/', (req, res, next) => {
    itemController.createItem(req, res, next)
});

router.get('/item-search', (req, res, next) => {
    itemController.searchItem(req, res, next)
});
router.get('/item-search-stock', (req, res, next) => {
    itemController.searchItemWithStock(req, res, next)
});
router.get('/item-stock-details', (req, res, next) => {
    itemController.itemStockDetails(req, res, next)
});
router.get('/stocks/all-brand', (req, res, next) => {
    itemController.getStockWorthBrandWise(req, res, next)
});
router.get('/by-brand', (req, res, next) => {
    itemController.getAllItemsOfABrand(req, res, next)
});


module.exports = router;