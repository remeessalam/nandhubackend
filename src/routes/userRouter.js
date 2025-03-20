const express = require("express");
const { getUser, updateUserDetails } = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();


// get user details
router.get("/", protect, getUser);
router.put("/update-profile", protect, updateUserDetails);

module.exports = router;
