const cartModel = require("../models/cartModel");
const productsModel = require("../models/productsModel");
const reviewModel = require("../models/reviewModel");
const wishlistModel = require("../models/wishlistModel");

//Product section
// Add a new product
exports.addProduct = async (data) => {
  const { productName, price, offerPercentage, description } = data;

  // Validation
  if (!productName || !price || !offerPercentage || !description) {
    return { message: "All fields are required" };
  }

  const newProduct = new productsModel({
    productName,
    price,
    offerPercentage,
    description,
  });
  await newProduct.save();

  return { message: "Product added successfully", newProduct };
};

// Get all products
exports.getProducts = async () => {
  const products = await productsModel.find();
  return products;
};

// Get product using id
exports.OneProductDetails = async (data) => {
  const product = await productsModel.findById(data);
  return product;
};

//Review section
exports.addReviews = async ({ data, userId }) => {
  const { productId, rating, comment, title } = data;

  // Check if the product exists
  const product = await productsModel.findById(productId);
  if (!product) return { message: "Product not found" };

  // Check if user already reviewed
  let existingReview = await reviewModel.findOne({
    productId,
    user: userId,
  });

  if (existingReview) {
    // Update existing review
    existingReview.comment = comment;
    existingReview.rating = rating;
    existingReview.title = title;
    await existingReview.save(); // Save updated review
    return {
      message: "Review updated successfully",
      review: existingReview,
    };
  }

  // Create new review if none exists
  const newReview = new reviewModel({
    productId,
    user: userId,
    rating,
    comment,
    title,
  });

  await newReview.save();
  return {
    message: "Review successfully added",
    review: newReview,
  };
};

exports.getProductReviews = async (userId) => {
  const reviews = await reviewModel
    .find({ user: userId })
    .populate("user", "product");

  if (!reviews.length) return { message: "No reviews found" };

  return reviews;
};

// Add item to cart
exports.addToCart = async (productId, quantity, userId) => {
  // Checking if the product exists
  const product = await productsModel.findById(productId);
  if (!product) return { message: "Product not found" };

  // Finding existing cart for the user
  let cart = await cartModel.findOne({ userId });

  if (!cart) {
    cart = new cartModel({ userId, items: [] });
  }

  // Checking the product already exists in the cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    // If product exists, update quantity
    existingItem.quantity = quantity;
  } else {
    // If product is not in cart, add new item
    cart.items.push({ productId, quantity });
  }

  // Save updated cart
  await cart.save();

  return { message: "Item added/updated in cart", cart };
};

exports.getCartData = async (userId) => {
  // Finding the user's cart and populating necessary fields
  let cart = await cartModel
    .findOne({ userId })
    .populate("userId")
    .populate("items.productId");

  if (!cart)
    return {
      success: true,
      message: "Cart not found",
    };

  // Convert Mongoose document to a plain object to modify it
  cart = cart.toObject();

  let totalPrice = 0;

  cart.items = cart.items.map((item) => {
    const product = item.productId;
    if (!product) return item;

    // Calculate price after discount
    const discountedPrice =
      product.price - (product.price * product.offerPercentage) / 100;

    // Calculate subtotal
    const subtotal = item.quantity * discountedPrice;

    // Update totalPrice
    totalPrice += subtotal;

    return { ...item, subtotal }; // Adding subtotal inside each item
  });

  // Setting total price in cart
  cart.totalPrice = totalPrice;

  return { success: true, message: "Cart items fetched", cart };
};

exports.removeCartItem = async (productId, userId) => {
  try {
    const cartItem = await cartModel.findOne({ userId });

    if (!cartItem) {
      return { message: "Cart not found" };
    }

    // Filter out the item with matching productId
    cartItem.items = cartItem.items.filter(
      (item) => !item.productId.equals(productId)
    );

    if (!cartItem.items) {
      return { message: "product not found" };
    }

    const updatedCart = await cartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true } // Returns the updated cart after the operation
    );
    return { success: true, message: "Product removed from cart", updatedCart };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { message: "Error removing product from cart", error };
  }
};

// Add item to Wishlist
exports.addListInWish = async (productId, userId) => {
  let wishlist = await wishlistModel.findOne({ user: userId });

  if (!wishlist) {
    // Create a new wishlist if it doesn't exist
    wishlist = new wishlistModel({ user: userId, products: [productId] });
  } else {
    if (wishlist?.products.includes(productId)) {
      wishlist.products = wishlist?.products.filter(
        (id) => id?.toString() !== productId
      );
      await wishlist.save();
      return {
        success: true,
        message: "Product removed from wishlist",
        wishlist,
      };
    }
    wishlist.products.push(productId);
  }

  await wishlist.save();
  return { message: "Product added to wishlist", wishlist };
};

exports.getListInWish = async (userId) => {
  const wishlist = await wishlistModel
    .findOne({ user: userId })
    .populate("products");

  if (!wishlist) {
    return { message: "Wishlist is empty", products: [] };
  }

  return { success: true, wishlist };
};

exports.removeListInWish = async (productId, userId) => {
  const wishlist = await wishlistModel.findOne({ user: userId });

  if (!wishlist) {
    return { message: "Wishlist not found" };
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();
  return { success: true, message: "Product removed from wishlist", wishlist };
};
