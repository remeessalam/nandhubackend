const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addresses: {
      type: [
        {
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          state: { type: String, required: true },
          country: { type: String, required: true, default: "India" },
          pinCode: { type: String, required: true },
          note: { type: String },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
