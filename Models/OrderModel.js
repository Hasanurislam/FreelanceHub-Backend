const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    gigId: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    payment_intent: {
      type: String,
      required: true,
    },
   status: {
      type: String,
      enum: ["Pending", "In Progress", "Delivered", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
