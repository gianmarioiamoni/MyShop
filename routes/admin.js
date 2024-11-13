const express = require('express');
const path = require('path');

const router = express.Router();

const adminController = require('../controllers/admin');
const shopController = require('../controllers/shop');

router.get('/add-product', adminController.getAddProduct);

router.post('/add-product', adminController.postAddProduct);

router.get('/products', adminController.getProducts);


module.exports = router;

