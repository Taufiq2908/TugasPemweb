const express = require("express");
const router = express.Router();
const controller = require("../controllers/userProfileController");

// GET semua review user + profil user
router.get("/:id/reviews", controller.getUserProfileReviews);

module.exports = router;
