const express = require("express");
const {
  addCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  detectNearbyCity
} = require("../controllers/cityController");

const router = express.Router();

router.post("/", addCity);
router.get("/", getCities);
router.get("/near", detectNearbyCity);
router.get("/:id", getCityById);
router.put("/:id", updateCity);
router.delete("/:id", deleteCity);

module.exports = router;
