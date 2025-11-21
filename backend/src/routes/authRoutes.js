const express = require("express");
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
