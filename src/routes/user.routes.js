const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.get('/', (req, res) => {
    userController.getAllUsers(req,res)
})

router.post('/', (req, res) => {
    userController.getUser(req,res)
})


module.exports = router;