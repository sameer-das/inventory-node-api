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


module.exports = router;