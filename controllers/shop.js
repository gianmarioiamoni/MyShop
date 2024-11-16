const Product = require('../models/product');
const Cart = require('../models/cart');


exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.fetchAll();
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        }); 
    } catch (err) {
        console.log(err);
    }
};

exports.getProductById = async (req, res, next) => {
    const prodId = req.params.productId;

    try {
        const product = await Product.findById(prodId);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: `/products`, // highlight "products" in navigation
        }); 
    } catch (err) {
        console.log(err);
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const products = await Product.fetchAll();
        res.render('shop/index', {
            prods: products,
            pageTitle: 'My Shop',
            path: '/',
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (let product of products) {
                const cartProduct = cart.products.find(prod => prod.id === product._id);
                if (cartProduct) {
                    cartProducts.push({productData: product, qty: cartProduct.qty})
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        })
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
        
    });
    res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};

exports.getOrders = (req, res, next) => {    
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};