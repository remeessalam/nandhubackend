const serverless = require("serverless-http");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middlewares/errorMiddleware");

const authRoutes = require("./src/routes/authRouter");
const userRoutes = require("./src/routes/userRouter");
const addressRoutes = require("./src/routes/addressRouter");
const productsRoutes = require("./src/routes/productRouter");
const orderRoutes = require("./src/routes/orderRoutes");

dotenv.config();
const app = express();
console.log("refresh");

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/health", (req, res) => {
  res.send("health ok.");
});

app.use(errorHandler);

// Export as a serverless function
module.exports.handler = serverless(app);
