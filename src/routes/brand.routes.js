const express = require('express');
const router = express.Router();

const brandController = require('../controllers/brand.controller');

router.get('/', (req, res, next) => {
    brandController.getAllBrands(req, res, next)
});

router.post('/', (req, res, next) => {
    brandController.createBrand(req, res, next)
});


module.exports = router;