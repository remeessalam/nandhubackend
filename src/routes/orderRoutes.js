const express = require("express");
const protect = require("../middlewares/authMiddleware");
const {
  createOrder,
  webhookTriggr,
  getOrder,
  getOneOrder,
  verifyOrder,
} = require("../controllers/orderController");

const router = express.Router();

// webhooks
router.post("/razorpay-webhook", express.json(), webhookTriggr);

// checkout section
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", verifyOrder);
router.get("/get-order", protect, getOrder);
router.get("/getOne-order/:id", protect, getOneOrder);

module.exports = router;
