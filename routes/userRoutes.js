const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../utils/auth");

//Register Account:
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    //checking whether user already exists

    if (!existingUser) {
      const passwordRegex =
        /(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,.\?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{6,}/g;
      const nameRegex = /^[A-Za-z]*$/;
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      //regex test and result will be checked using if condition
      const nameResult = nameRegex.test(name);
      if (name.length < 2 || !nameResult) {
        return res
          .status(400)
          .json(
            "First Name must be 2 or more Characters Long and contains only alphabets."
          );
      }
      const emailTestResult = emailRegex.test(email);
      if (!emailTestResult) {
        return res.status(400).json("Please Enter Valid E-Mail.");
      }
      const passwordTestResult = passwordRegex.test(password);
      if (password.length < 6 || !passwordTestResult) {
        return res
          .status(400)
          .json(
            "Password must be 6 or more Characters Long and contains a Capital letter, a Small letter, a Numeric digit, and a Special Character."
          );
      }
      //converting email to lowercase incase of any user typo's
      const emailLowerCase = email.toLowerCase();
      const salt = await bcrypt.genSalt(10);
      //password Hashing
      const hashedPass = await bcrypt.hash(password, salt);
      const newUser = await new User({
        name,
        email: emailLowerCase,
        password: hashedPass,
      });
      const user = await newUser.save();
      const token = await jwt.sign(
        { email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2d",
        }
      );
      delete user._doc.password;
      return res.status(201).json({ ...user._doc, token: token });
    } else {
      return res.status(404).json("User already exists");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//Login:
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json("Incorrect username or Password");
    } else {
      const validPassword = await bcrypt.compareSync(
        password,
        existingUser.password
      );

      if (!validPassword) {
        return res.status(400).json("Incorrect username or Password");
      }

      const token = await jwt.sign(
        { email: existingUser.email, isAdmin: existingUser.isAdmin },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );
      delete existingUser._doc.password;

      return res.status(200).json({ ...existingUser._doc, token: token });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// get users;

router.get("/", authenticate, async (req, res) => {
  try {
    //to check the user whether he is a actual admin by comparing the value from the decodedToken and in the database
    const adminUser = await User.findOne({ email: req.user.email });
    if (req.user.isAdmin === adminUser.isAdmin) {
      const users = await User.find({ isAdmin: false });
      // .populate("orders");
      return res.status(200).json(users);
    } else {
      return res.status(401).send("Unauthorized Usage");
    }
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

module.exports = router;
