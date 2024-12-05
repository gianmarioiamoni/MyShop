const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
    // Validation
    body('title', 'Title should be at least 3 characters long!')
        .isLength({ min: 3 })
        .trim(),
    body('price', 'Please enter a valid price.')
        .isFloat(),
    body('description', 'Description should be at least 5 characters long!')
        .isLength({ min: 5 })
        .trim(),
    isAuth,
    adminController.postAddProduct);

router.get('/edit-product/:productId',
    // Validation
    body('title', 'Title should be at least 3 characters long!')
        .isLength({ min: 3 })
        .trim(),
    body('price', 'Please enter a valid price.')
        .isFloat(),
    body('description', 'Description should be at least 5 characters long!')
        .isLength({ min: 5 })
        .trim(),
    isAuth,
    adminController.getEditProduct);

router.post('/edit-product',
    // Validation
    body('title', 'Title should be at least 3 characters long!')
        .isLength({ min: 3 })
        .trim(),
    body('price', 'Please enter a valid price.')
        .isFloat(),
    body('description', 'Description should be at least 5 characters long!')
        .isLength({ min: 5 })
        .trim(),
    isAuth,
    adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
