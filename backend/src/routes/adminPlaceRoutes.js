const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllPlacesByAdmin,   // ✅ BARU
  getPendingPlaces,
  approvePlace,
  rejectPlace,
  createPlaceByAdmin,
  updatePlaceByAdmin,
  deletePlaceByAdmin,
  getPlaceByIdAdmin
} = require("../controllers/adminPlaceController");

const router = express.Router();

// =========================
// ADMIN VIEW RESTO
// =========================
router.get("/places", protect, getAllPlacesByAdmin); // ✅ UTAMA
router.get("/places/pending", protect, getPendingPlaces);
router.get("/places/:id", protect, getPlaceByIdAdmin);

// =========================
// VERIFIKASI RESTO OWNER
// =========================
router.put("/places/:id/approve", protect, approvePlace);
router.put("/places/:id/reject", protect, rejectPlace);

// =========================
// CRUD RESTO OLEH ADMIN
// =========================
router.post("/places", protect, createPlaceByAdmin);
router.put("/places/:id", protect, updatePlaceByAdmin);
router.delete("/places/:id", protect, deletePlaceByAdmin);

module.exports = router;
