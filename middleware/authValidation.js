const { check, body } = require('express-validator');
const User = require('../models/user');

exports.loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
    // .normalizeEmail(),
    ,
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
];

exports.signupValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(async (value) => {
            const userDoc = await User.findOne({ email: value });
            if (userDoc) {
                throw new Error('E-Mail exists already, please pick a different one.');
            }
        }),
        // .normalizeEmail(),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
];
