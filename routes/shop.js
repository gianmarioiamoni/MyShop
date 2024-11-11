const express = require('express');
const path = require('path')
const rootDir = require('../utils/path');
const adminData = require('./admin');

const router = express.Router();


router.get('/', (req, res) => {
    // e pass the data to be used in the template as an object with an id key
    res.render('shop', {prods: adminData.products, pageTitle: 'My Shop', path: '/'}); // use the default templates engine and return It
});

module.exports = router;