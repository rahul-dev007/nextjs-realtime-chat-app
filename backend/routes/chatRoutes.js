const express = require("express");
const Message = require("../models/Message");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", protect, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 }).populate("user", "name role");
  res.json(messages);
});

// Delete message (only admin/superadmin)
router.delete("/:id", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: "Message deleted" });
});

module.exports = router;
