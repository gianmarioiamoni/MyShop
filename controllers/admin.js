const { validationResult } = require('express-validator');
const Product = require('../models/product');

const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file; // from multer
  
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  res.redirect('/');
  try {
    await product.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
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
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { prodId, title, price, description } = req.body;
  const image = req.file;
  
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = await Product.findById(prodId);

  // Check if the product belong to the logged user
  if (product.userId.toString() !== req.user._id.toString()) {
    return res.redirect('/');
  }

  // assign new values to the edited product
  product.title = title;
  product.price = price;
  product.description = description;

  // Update image field only if we selected a new image
  if (image) {
    fileHelper.deleteFile(product.imageUrl);
    product.imageUrl = image.path;
  }

  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    // retrieve only products of the user
    const products = await Product.find({ userId: req.user._id })//.populate('userId');
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }  
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  
  try {
    // delete product image
    const product = await Product.findById(prodId);
    if (!product) {
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    // delete the product only if it belongs to the user
    const deletedProduct = await Product.deleteOne({_id: prodId, userId: req.user._id});
    res.status(200).json({message: 'Success!'});
    return deletedProduct;
  } catch (err) {
    res.status(500).json({message: 'Deleting product failed!'});
  }
};
