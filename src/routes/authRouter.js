const express = require("express");
const {
  signUp,
  login,
  changePassword,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", login);
router.post("/signup", signUp);
router.post("/changePassword", protect, changePassword);

module.exports = router;
