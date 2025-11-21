const express = require("express");
const router = express.Router();
const controller = require("../controllers/placeController");

// GET semua tempat
router.get("/", controller.getAllPlaces);

// GET tempat berdasarkan kota
router.get("/city/:id", controller.getPlacesByCity);

// GET detail tempat
router.get("/:id", controller.getPlaceById);

module.exports = router;
