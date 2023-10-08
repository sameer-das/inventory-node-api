const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');

router.get('/', (req, res, next) => {
    categoryController.getAllCategories(req, res, next)
});

router.post('/', (req, res, next) => {
    categoryController.createCategory(req, res, next)
});


module.exports = router;