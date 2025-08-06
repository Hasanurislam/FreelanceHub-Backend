const Message = require("../Models/MessageModel.js");
const Conversation = require("../Models/ConversionModel.js");
const createError = require("../utils/createError.js");

// Logic to create a new message
const createMessage = async (req, res, next) => {
  const newMessage = new Message({
    conversationId: req.body.conversationId,
    userId: req.userId,
    desc: req.body.desc,
  });

   try {
    const savedMessage = await newMessage.save();
    await Conversation.findOneAndUpdate(
      { id: req.body.conversationId },
      {
        $set: {
          readBySeller: req.isSeller,
          readByBuyer: !req.isSeller,
          lastMessage: req.body.desc,
          lastMessageSenderId: req.userId, 
        },
      },
      { new: true }
    );
    res.status(201).send(savedMessage);
  } catch (err) {
    next(err);
  }
};

// to get all messages for a conversation
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id });
    res.status(200).send(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, getMessages };