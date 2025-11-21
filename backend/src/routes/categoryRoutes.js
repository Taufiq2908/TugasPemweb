const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryController");

// GET semua kategori
router.get("/", controller.getAllCategories);

// GET semua restoran berdasarkan kategori
router.get("/:id/places", controller.getPlacesByCategory);

module.exports = router;
