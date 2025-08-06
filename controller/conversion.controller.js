const Conversation = require("../Models/ConversionModel.js");
const createError = require("../utils/createError.js");
const mongoose = require("mongoose");

// Logic to create a new conversation (or find an existing one)
const createConversation = async (req, res, next) => {
  const conversationId = req.isSeller ? req.userId + req.body.to : req.body.to + req.userId;
  try {
    const existingConversation = await Conversation.findOne({ id: conversationId });
    if (existingConversation) {
      return res.status(200).send(existingConversation);
    }
    const newConversation = new Conversation({
      id: conversationId,
      sellerId: req.isSeller ? req.userId : req.body.to,
      buyerId: req.isSeller ? req.body.to : req.userId,
      readBySeller: req.isSeller,
      readByBuyer: !req.isSeller,
    });
    const savedConversation = await newConversation.save();
    res.status(201).send(savedConversation);
  } catch (err) {
    next(err);
  }
};

// ✅ FIX: This function now reliably fetches the other user's username
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.aggregate([
      {
        $match: req.isSeller
          ? { sellerId: req.userId }
          : { buyerId: req.userId },
      },
      {
        $lookup: {
          from: "users", // NOTE: This must be the plural name of your User model collection
          let: {
            otherUserId: req.isSeller ? "$buyerId" : "$sellerId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$otherUserId" }],
                },
              },
            },
            {
              $project: {
                username: 1,
                _id: 0,
              },
            },
          ],
          as: "otherUserDetails",
        },
      },
      {
        $addFields: {
          otherUsername: { $arrayElemAt: ["$otherUserDetails.username", 0] },
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);
    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};

// Logic to update a conversation (e.g., mark as read)
const updateConversation = async (req, res, next) => {
    try {
        const updatedConversation = await Conversation.findOneAndUpdate(
            { id: req.params.id },
            { $set: { ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }) } },
            { new: true }
        );
        res.status(200).send(updatedConversation);
    } catch (err) {
        next(err);
    }
};

// Logic to get a single conversation by its unique ID
const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Not found!"));
    res.status(200).send(conversation);
  } catch (err) {
    next(err);
  }
};

module.exports = {
    createConversation,
    getConversations,
    updateConversation,
    getSingleConversation
};