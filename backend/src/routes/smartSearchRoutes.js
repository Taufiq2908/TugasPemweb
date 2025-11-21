const express = require("express");
const router = express.Router();
const controller = require("../controllers/smartSearchController");

router.post("/", controller.smartSearch);

module.exports = router;
