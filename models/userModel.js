const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Object,
      default: {
        total: 0,
        count: 0,
      },
    },
    notifications: {
      type: Array,
      default: [],
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
