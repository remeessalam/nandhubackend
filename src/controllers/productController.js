const productService = require("../services/productService");

//Product section
exports.addProduct = async (req, res, next) => {
  try {
    const product = await productService.addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.status(201).json(products);
  } catch (error) {
    next(error);
  }
};

exports.getOneProduct = async (req, res, next) => {
  try {
    const productId = req.params?.id;
    const product = await productService.OneProductDetails(productId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

//Review section
exports.addReview = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const data = req?.body;
    const product = await productService.addReviews({ data, userId });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const product = await productService.getProductReviews(userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

//Cart section
exports.addtoCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?._id;
    const product = await productService.addToCart(productId, quantity, userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getCarts = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const product = await productService.getCartData(userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const productId = req.user?.id;
    const userId = req.user?._id;

    const wishList = await productService.removeCartItem(productId, userId);
    res.status(201).json(wishList);
  } catch (error) {
    next(error);
  }
};

//Wish list section
exports.addWishlist = async (req, res, next) => {
  try {
    const { products } = req.body;

    const userId = req.user?._id;
    const wishList = await productService.addListInWish(products, userId);
    res.status(201).json(wishList);
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const wishList = await productService.getListInWish(userId);
    res.status(201).json(wishList);
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { products } = req.user?.id;
    const userId = req.user?._id;
    const wishList = await productService.removeListInWish(products, userId);
    res.status(201).json(wishList);
  } catch (error) {
    next(error);
  }
};
