const mongoose = require('mongoose');
const Review = require('../Models/ReviewModel.js');
const Gig = require('../Models/gigModel.js');
const User = require('../Models/userModel.js'); // ✅ Add User model
const createError=require('../utils/createError.js')
const Order = require('../Models/OrderModel.js'); 


// Create a new review

const createReview = async (req, res, next) => {
  if (req.isSeller) {
    return next(createError(403, "Sellers can't create a review!"));
  }

  const newReview = new Review({
    userId: req.userId,
    gigId: req.body.gigId,
    desc: req.body.desc,
    star: req.body.star,
  });

  try {
    //  Check if a review already exists
    const existingReview = await Review.findOne({
      gigId: req.body.gigId,
      userId: req.userId,
    });

    if (existingReview) {
      return next(
        createError(403, "You have already created a review for this gig!")
      );
    }

    //  Check if the user has purchased and completed the order
    const completedOrder = await Order.findOne({
      gigId: req.body.gigId,
      buyerId: req.userId,
      status: "Completed",
    });

    if (!completedOrder) {
      return next(
        createError(403, "You can only review gigs you have purchased!")
      );
    }

    //  Save the new review and update the gig's rating
    const savedReview = await newReview.save();

    await Gig.findByIdAndUpdate(req.body.gigId, {
      $inc: { totalStars: req.body.star, starNumber: 1 },
    });

    res.status(201).send(savedReview);
  } catch (err) {
    next(err);
  }
};

// Get all reviews for a gig
const getGigReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId });

    const userIds = reviews.map((r) => r.userId);
    const validUserIds = userIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const users = await User.find({ _id: { $in: validUserIds } });

    const reviewsWithUser = reviews.map((review) => {
      const user = users.find((u) => u._id.toString() === review.userId);
      return {
        ...review._doc,
        user: user ? { username: user.username, img: user.img } : null,
      };
    });

    res.status(200).json(reviewsWithUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review.userId !== req.userId) {
      return res.status(403).json({ message: "You can delete only your review." });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReview,
  getGigReviews,
  deleteReview,
};
