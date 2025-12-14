const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getMyPlaces,
  getMyPlaceById,
  createPlace,
  updateMyPlace
} = require("../controllers/ownerPlaceController");

const router = express.Router();

// OWNER ONLY
router.get("/places", protect, getMyPlaces);
router.get("/places/:id", protect, getMyPlaceById);
router.post("/places", protect, createPlace);
router.put("/places/:id", protect, updateMyPlace);

module.exports = router;
