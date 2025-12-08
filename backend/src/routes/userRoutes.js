const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/userController");

const router = express.Router();

// GET /users/profile → butuh token
router.get("/profile", protect, getProfile);
router.put("/profile/update", protect, updateProfile);


module.exports = router;
