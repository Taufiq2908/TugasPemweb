const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// =====================================
// GET semua review untuk 1 restoran
// =====================================
router.get("/place/:id", controller.getReviewsByPlace);

// =====================================
// GET semua review milik user
// =====================================
router.get("/user/:id", controller.getReviewsByUser);

// =====================================
// POST tambah review
// =====================================
router.post("/", protect, controller.addReview);

// =====================================
// DELETE review (hanya pemilik review)
// =====================================
router.delete("/:id", protect, controller.deleteReview);

module.exports = router;
