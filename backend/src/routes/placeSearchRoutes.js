const express = require("express");
const router = express.Router();
const controller = require("../controllers/placeSearchController");

// GET /places/search
router.get("/search", controller.searchPlaces);

module.exports = router;
