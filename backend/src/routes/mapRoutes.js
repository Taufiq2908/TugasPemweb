const express = require("express");
const router = express.Router();
const {
  getPlacesForMap,
  getNearbyPlaces,
  getSinglePlaceForMap
} = require("../controllers/mapController");

// Semua tempat (opsional filter by city_id)
router.get("/places", getPlacesForMap);

// Nearby tempat berdasarkan lat, lon, radius
router.get("/nearby", getNearbyPlaces);

// Satu tempat untuk detail map
router.get("/place/:id", getSinglePlaceForMap);

module.exports = router;
