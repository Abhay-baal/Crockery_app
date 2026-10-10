const express = require("express");

const {
  register,
  login,
  getMe,
  updateMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin access confirmed",
    user: req.user,
  });
});

module.exports = router;
