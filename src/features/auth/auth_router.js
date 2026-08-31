const express = require('express');
const authController = require('./auth_controller');
const router = express.Router();

router.post('/sendOtp', authController.sendOtp);

router.post('/verifyOtp', authController.verifyOtp);


module.exports = router;