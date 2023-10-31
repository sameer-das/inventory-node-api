const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/', async (req, res, next) => {
    await authController.authenticate(req, res, next);
});


module.exports = router;