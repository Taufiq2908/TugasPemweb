const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");

// GET semua review restoran
router.get("/place/:id", controller.getReviewsByPlace);

// POST tambah review
router.post("/", controller.addReview);

// PATCH like review
router.patch("/:id/like", controller.likeReview);

module.exports = router;
