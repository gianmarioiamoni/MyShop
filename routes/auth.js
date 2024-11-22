const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const { loginValidation, signupValidation } = require('../middleware/authValidation');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);

router.post('/login', loginValidation, authController.postLogin);

router.post('/signup', signupValidation, authController.postSignup);

router.post('/logout', authController.postLogout);

// Reset password
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
