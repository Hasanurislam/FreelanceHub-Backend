const express = require("express");
const { intent, confirm, getOrders, updateStatus,checkPurchase } = require("../controller/order.controller.js");
const { varifyToken } = require("../middleware/jwt.js");

const router = express.Router();

router.post("/create-payment-intent/:id", varifyToken, intent);
router.get("/", varifyToken, getOrders);
router.put("/confirm", confirm); // This confirms payment
router.put("/:orderId/status", varifyToken, updateStatus); // Route for seller to update status
router.get("/check-purchase/:gigId", varifyToken, checkPurchase);
module.exports = router;