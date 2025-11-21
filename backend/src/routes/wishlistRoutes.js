const express = require("express");
const router = express.Router();
const controller = require("../controllers/wishlistController");

// GET semua wishlist user
router.get("/:userId", controller.getWishlistByUser);

// POST tambah wishlist
router.post("/", controller.addToWishlist);

// DELETE hapus wishlist
router.delete("/", controller.removeFromWishlist);

module.exports = router;
