const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, getUserPublicProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile/update", protect, updateProfile);
router.get("/:id", getUserPublicProfile);

module.exports = router;
