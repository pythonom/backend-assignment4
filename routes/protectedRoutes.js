const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route!",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
