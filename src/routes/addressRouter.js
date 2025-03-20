const express = require("express");
const {
  addAddress,
  getAddress,
  setAddressDefault,
} = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

//  user address
router.post("/addAddress", protect, addAddress);
router.get("/", protect, getAddress);
router.put("/setAddressDefault", protect, setAddressDefault);

module.exports = router;
