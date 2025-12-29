const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const airtimeController = require("../controllers/airtime.controller");

router.post("/purchase", authMiddleware, airtimeController.purchaseAirtime);

module.exports = router;
