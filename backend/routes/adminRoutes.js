const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middlewares/authMiddleware");
// Only superadmin can manage roles
const superadminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};

// Get all users
router.get("/users", protect, superadminOnly, async (req, res) => {
  const users = await User.find().select("name email role");
  res.json(users);
});

// Update user role
router.put("/user/:id/role", protect, superadminOnly, async (req, res) => {
  const { role } = req.body; // "user", "admin", "superadmin"
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();
  res.json({ message: "Role updated", user });
});

module.exports = router;
