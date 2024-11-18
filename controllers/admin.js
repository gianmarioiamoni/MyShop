const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  await product.save();

  res.redirect('/');
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
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { prodId, title, imageUrl, price, description } = req.body;

  const product = await Product.findById(prodId);

  // Check if the product belong to the logged user
  if (product.userId.toString() !== req.user._id.toString()) {
    return res.redirect('/');
  }

  // assign new values to the edited product
  product.title = title;
  product.price = price;
  product.description = description;
  product.imageUrl = imageUrl;
  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
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
    console.log(err);
  }  
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  
  try {
    // delete the product only if it belongs to the user
    const product = await Product.deleteOne({_id: prodId, userId: req.user._id});
    if (!product) {
      console.log("You are not allowed to delete the product")
    }
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};
