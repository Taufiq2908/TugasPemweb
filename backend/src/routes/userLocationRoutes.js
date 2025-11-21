const express = require("express");
const router = express.Router();
const controller = require("../controllers/userLocationController");

// Cek lokasi user & kirim email wishlist jika perlu
router.post("/check-location", controller.checkLocationAndNotify);

module.exports = router;
