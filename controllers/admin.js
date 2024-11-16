const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = async (req, res, next) => {
    const {title, imageUrl, description, price} = req.body;
    
    const product = new Product(
        title,
        imageUrl,
        description,
        price);
    
    try {
        await product.save();
        console.log('Product created');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }

};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;

    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, description, price } = req.body;
    
    const updatedProduct = new Product(
        title,
        imageUrl,
        description,
        price,
        productId
    );
    try {
        updatedProduct.save();
        console.log('Product updated');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.fetchAll();
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        }); 
    } catch (err) {
        console.log(err);
    }
}

exports.postDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;

    try {
        await Product.deleteById(prodId);
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};