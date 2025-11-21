const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/reviewLikeController");

// Like review
router.post("/:reviewId/like", protect, controller.likeReview);

// Unlike review
router.delete("/:reviewId/unlike", protect, controller.unlikeReview);

// Get total likes
router.get("/:reviewId/likes", controller.getReviewLikes);

module.exports = router;
