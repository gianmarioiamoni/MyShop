const express = require('express');
const { check, body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);

router.post(
    '/login',
    // validation middlewares
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail(),
        // check password in the body of the request
        body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin);
router.post(
    '/signup',
    // validation middlewares
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom(async (value, { req }) => {
                const userDoc = await User.findOne({ email: value });
                if (userDoc) {
                    return Promise.reject('E-Mail exists already, please pick a different one.');
                }
                return true;
            })
            .normalizeEmail(),
        // check password in the body of the request
        body(
            'password',
            // common error message for password validation
            'Please enter a password with only numbers and text and at least 5 characters.'
        )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        // check equality for password and confirm password
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match.');
                }
                return true;
        })
    ],
    authController.postSignup);
router.post('/logout', isAuth, authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;