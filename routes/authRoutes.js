const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const eventEmitter = require("../events/eventEmitter");

const router = express.Router();

// ===============================
// SIGNUP API
// ===============================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Checking existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    // Create new user
    // Password automatically gets hashed by User.js
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Trigger registration event
    eventEmitter.emit("userRegistered", user);

    // Send response
    res.status(201).json({
      message: "User registered successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

// ===============================
// LOGIN API
// ===============================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // required fields checking
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and explicitly retrieve password
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Comparing entered password with stored hash
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generating JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      },
    );

    // Successful login
    res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
