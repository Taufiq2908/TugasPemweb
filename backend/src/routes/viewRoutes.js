// src/routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Rute untuk membuka halaman HTML
router.get('/', viewController.renderHome);
router.get('/search', viewController.renderSearch);
router.get('/detail/:id', viewController.renderDetail);

module.exports = router;