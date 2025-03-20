const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const { default: mongoose } = require("mongoose");
const sendEmail = require("../config/nodeMailer");
const addressModel = require("../models/addressModel");

exports.createOrder = async ({ isExpressDelivery, userId }) => {
  console.log(isExpressDelivery, "cattt");

  const user = await userModel.findById({ _id: userId });
  const addressData = await addressModel.findOne(
    { userId, "addresses.isDefault": true },
    { "addresses.$": 1 }
  );

  if (!addressData) {
    return { message: "No default address found" };
  }

  const defaultAddress = addressData.addresses[0];

  if (!user) return { message: "User not found" };

  // Fetch cart details
  let cart = await cartModel
    .findOne({ userId })
    .populate("userId")
    .populate("items.productId");
  if (!cart) return { message: "Cart not found" };

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

  const options = {
    amount: totalPrice * 100, // Convert to paise
    currency: "INR",
    receipt: `order_rcptid_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  // Save payment details to MongoDB
  const newPayment = new orderModel({
    orderId: order.id,
    amount: order.amount / 100, // Convert to INR
    currency: order.currency,
    status: "captured",
    method: order.method,
    address: defaultAddress,
    userId: user._id,
    isExpressDelivery,
  });

  await newPayment.save();
  return { success: true, order };
};

exports.getUserorder = async ({ userId }) => {
  // Validate user existence
  const user = await userModel.findById(userId);

  if (!user) return { message: "User not found" };

  // Ensure userId is an ObjectId for the query
  const order = await orderModel.findOne(userId).populate("address", "userId");

  if (!order) {
    return { success: false, message: "No orders found for this user" };
  }

  return { success: true, order };
};

exports.getOneUserorder = async ({ userId, orderId }) => {
  const user = await userModel
    .findById({
      userId: new mongoose.Types.ObjectId(userId),
    })
    .populate("address", "userId");
  if (!user) return { message: "User not found" };
  const order = await orderModel
    .findById({ orderId })
    .populate("userId", "address");

  return { success: true, order };
};

exports.orderWebhooks = async (data) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(data);

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature === signature) {
    console.log("Webhook verified successfully!");

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      console.log("Payment captured:", payload.payment.entity);

      const paymentDetails = await orderModel.findByIdAndUpdate(
        paymentEntity.order_id, // Assuming this is the MongoDB _id
        {
          paymentId: paymentEntity.id,
          signature: signature,
          amount: paymentEntity.amount / 100, // Convert to INR
          currency: paymentEntity.currency,
          status: "captured",
          method: paymentEntity.method,
          email: paymentEntity.email,
          contact: paymentEntity.contact,
          address: paymentEntity.notes,
          isExpressDelivery: false,
        },
        { new: true, upsert: true } // Returns updated doc & creates if not found
      );

      return paymentDetails;
    } else if (event === "payment.failed") {
      console.log("Payment failed:", payload.payment.entity);
      // Handle failed payments
    }

    return { success: true, message: "Webhook received" };
  } else {
    console.log("Invalid webhook signature");
    return { success: false, message: "Invalid signature" };
  }
};

exports.verifyPayment = async (data) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
    data;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Generate expected signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Capture payment after successful verification
    const captureResponse = await razorpay.payments.capture(
      razorpay_payment_id,
      amount,
      "INR"
    );

    // Check if the order exists in the database
    const existingOrder = await orderModel
      .findOne({
        orderId: razorpay_order_id,
      })
      .populate("address", "userId");

    console.log(existingOrder, "ex");

    if (existingOrder) {
      // Update the existing order
      await orderModel.findByIdAndUpdate(
        existingOrder._id,
        {
          paymentId: razorpay_payment_id,
          amount: amount / 100, // Convert to INR
          currency: "INR",
          status: "captured",
          method: captureResponse.method,
        },
        { new: true } // Returns updated document
      );
    } else {
      // Save new order if it doesn't exist
      const newOrder = new orderModel({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: amount / 100, // Convert to INR
        currency: "INR",
        status: "captured",
        method: captureResponse.method,
      });

      await newOrder.save();
    }

    // email-----------------------
    let x = {
      to: "arkenterprises278@gmail.com",
      subject: "Order purchased!",
      body: "Thank you for purchasing our product! We will reach out to you soon!",
      name: "arkforease",
    };
    let responseFromEmail = await sendEmail(x);
    // email-----------------
    return {
      success: true,
      message: "Payment verified and captured successfully!",
      captureResponse,
      responseFromEmail,
    };
  } else {
    return { success: false, message: "Invalid signature!" };
  }
};
