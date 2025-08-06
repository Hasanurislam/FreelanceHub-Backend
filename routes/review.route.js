const express=require('express')
const { createReview , getGigReviews, deleteReview } = require("../controller/review.controller.js");
const { varifyToken } =require("../middleware/jwt.js");

const router = express.Router();

// Create a review
router.post("/", varifyToken, createReview);

// Get all reviews for a gig
router.get("/:gigId", getGigReviews);

// Delete a review
router.delete("/:id", varifyToken, deleteReview);

module.exports = router;
