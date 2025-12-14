const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getUserPublicProfile,
  registerOwner
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile/update", protect, updateProfile);

// USER → OWNER
router.post("/register-owner", protect, registerOwner);

router.get("/:id", getUserPublicProfile);

module.exports = router;
