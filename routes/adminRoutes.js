const express = require("express");

const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Only authenticated administrators can access this route
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Admin access granted.",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
