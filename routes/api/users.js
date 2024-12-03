const express = require("express");
const User = require("../../models/schemaUser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const auth = require("../../auth/auth");

const secret = process.env.AUTH_SECRET;

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (user) {
    return res.status(409).json({ message: "This email is already in use." });
  }

  try {
    const newUser = new User({ email });
    await newUser.setPassword(password);
    await newUser.save();
    return res
      .status(201)
      .json({ message: `Registration succesful: user ${email}` });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await user.validatePassword(password);
    if (!user) {
      return res.status(401).json({ message: "No such user" });
    }
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email or password is wrong!" });
    }
    if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        email: user.email,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      user.token = token;
      await user.save();
      return res.status(200).json({
        message: `Login succesful: user ${email}`,
        data: { token },
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authorized!" });
    }
    user.token = null;
    await user.save();

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  try {
    const user = req.user;
    // const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not authorized!" });
    }
    return res.status(200).json({
      message: `Current user ${user.email}, subscription ${user.subscription}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;