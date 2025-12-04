const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");

// GET semua review restoran
router.get("/place/:id", controller.getReviewsByPlace);

// POST tambah review
router.post("/", controller.addReview);


module.exports = router;
