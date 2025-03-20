// authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    const { id } = decoded;
    const user = await userModel.findById(id);
    if (!user) throw new Error("User not exists please sign up");
    req.user = user;

    next();
  } catch (err) {
    res
      .status(403)
      .json({ success: false, error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
