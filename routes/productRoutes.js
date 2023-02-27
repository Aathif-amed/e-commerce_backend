const router = require("express").Router();
const Product = require("../models/productModel");
const User = require("../models/userModel");
const authenticate = require("../utils/auth");

//get products;
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
//create product
router.post("/createProduct", authenticate, async (req, res) => {
  try {
    //to check the user whether he is a actual admin by comparing the value from the decodedToken and in the database
    const adminUser = await User.findOne({ email: req.user.email });

    if (req.user.isAdmin && adminUser.isAdmin) {
      const { name, description, price, category, images: pictures } = req.body;
      const productPrice = Number(price);
      const product = await Product.create({
        name,
        description,
        price: productPrice,
        category,
        pictures,
      });
      const products = await Product.find();
      return res.status(201).json(products);
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// update product

router.patch("/updateProduct/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    //to check the user whether he is a actual admin by comparing the value from the decodedToken and in the database
    const adminUser = await User.findOne({ email: req.user.email });
    if (req.user.isAdmin && adminUser.isAdmin) {
      const { name, description, price, category, images: pictures } = req.body;
      const product = await Product.findByIdAndUpdate(id, {
        name,
        description,
        price,
        category,
        pictures,
      });
      const products = await Product.find();
      return res.status(200).json(products);
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// delete product

router.delete("/deleteProduct/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    //to check the user whether he is a actual admin by comparing the value from the decodedToken and in the database
    const adminUser = await User.findOne({ email: req.user.email });
    if (req.user.isAdmin && adminUser.isAdmin) {
      await Product.findByIdAndDelete(id);
      const products = await Product.find();
      return res.status(200).json(products);
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    const similar = await Product.find({ category: product.category }).limit(5);
    return res.status(200).json({ product, similar });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    let products;
    const sort = { _id: -1 };
    if (category == "all") {
      products = await Product.find().sort(sort);
    } else {
      products = await Product.find({ category }).sort(sort);
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// cart routes

router.post("/addToCart", authenticate, async (req, res) => {
  const { userId, productId, price } = req.body;

  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    if (user.cart[productId]) {
      userCart[productId] += 1;
    } else {
      userCart[productId] = 1;
    }
    userCart.count += 1;
    userCart.total = Number(userCart.total) + Number(price);
    user.cart = userCart;

    user.markModified("cart");
    await user.save();
    return res.status(200).json({ ...user._doc, token: req.user.token });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/increaseCart", authenticate, async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total += Number(price);
    userCart.count += 1;
    userCart[productId] += 1;
    user.cart = userCart;

    user.markModified("cart");
    await user.save();
    return res.status(200).json({ ...user._doc, token: req.user.token });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/decreaseCart", authenticate, async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(price);
    userCart.count -= 1;
    userCart[productId] -= 1;
    user.cart = userCart;

    user.markModified("cart");
    await user.save();
    return res.status(200).json({ ...user._doc, token: req.user.token });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/removeFromCart", authenticate, async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(userCart[productId]) * Number(price);
    userCart.count -= userCart[productId];
    delete userCart[productId];
    user.cart = userCart;
    user.markModified("cart");
    await user.save();
    return res.status(200).json({ ...user._doc, token: req.user.token });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
