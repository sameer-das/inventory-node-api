const express = require('express');
const router = express.Router();

const itemController = require('../controllers/item.controller');

router.get('/', (req, res, next) => {
    itemController.getAllItems(req, res, next)
});

router.post('/', (req, res, next) => {
    itemController.createItem(req, res, next)
});


module.exports = router;