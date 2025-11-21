const express = require("express");
const router = express.Router();
const controller = require("../controllers/cityController");

// ❗ TARUH INI PALING ATAS
router.get("/detect-nearby", controller.detectNearbyCity);

// ROUTE BIASA
router.get("/", controller.getCities);
router.post("/", controller.addCity);

// ❗ TARUH /:id PALING BAWAH
router.get("/:id", controller.getCityById);
router.put("/:id", controller.updateCity);
router.delete("/:id", controller.deleteCity);

module.exports = router;
