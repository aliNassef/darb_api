const express = require('express');
const authController = require('./auth_controller');
const router = express.Router();

// todo: add handler 
router.post('/sendOtp', authController.sendOtp);



module.exports = router;