const router = require("express").Router();
const authenticate = require("../utils/auth");
const dotenv = require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const Order = require("../models/orderModule");
const User = require("../models/userModel");

// getting all orders

router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find().populate("owner", ["email", "name"]);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});
//creating an order

router.post("/create", authenticate, async (req, res) => {
  const io = req.app.get("socketio");
  const { userId, cart, country, address } = req.body;
  try {
    const user = await User.findById(userId);
    const order = await Order.create({
      owner: user._id,
      products: cart,
      country,
      address,
    });
    order.count = cart.count;
    order.total = cart.total;
    await order.save();
    user.cart = { total: 0, count: 0 };
    user.orders.push(order);
    const notification = {
      status: "unread",
      message: `New order from ${user.name}`,
      time: new Date(),
    };
    io.sockets.emit("new-order", notification);
    user.markModified("orders");
    await user.save();
    return res.status(200).json({ ...user._doc, token: req.user.token });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

//shipping order

router.patch("/:id/markShipped", authenticate, async (req, res) => {
  const io = req.app.get("socketio");
  const { ownerId } = req.body;
  const { id } = req.params;
  const user = await User.findById(ownerId);
  const adminUser = await User.findOne({ email: req.user.email });
  try {
    if (req.user.isAdmin && adminUser.isAdmin) {
      await Order.findByIdAndUpdate(id, { status: "shipped" });
      const orders = await Order.find().populate("owner", ["email", "name"]);
      const notification = {
        status: "unread",
        message: `Order ${id} shipped with success`,
        time: new Date(),
      };
      io.sockets.emit("notification", notification, ownerId);
      user.notifications.push(notification);
      await user.save();
      return res.status(200).json(orders);
    } else {
      throw new Error("Unauthorized");
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
});
module.exports = router;

//payment

router.post("/createPayment", authenticate, async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      payment_method_types: ["card"],
    });
    res.status(200).json(paymentIntent);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

module.exports = router;
