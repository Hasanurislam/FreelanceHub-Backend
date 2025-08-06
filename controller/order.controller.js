const Order = require("../Models/OrderModel.js");
const Gig = require("../Models/gigModel.js");
const User = require("../Models/userModel.js");
const Stripe = require('stripe');
const createError = require("../utils/createError.js");

// --- Your other functions (intent, confirm, etc.) remain the same ---
const intent = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE);
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found"));
    if (gig.userId.toString() === req.userId.toString()) {
      return next(createError(403, "Sellers cannot order their own gig"));
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: gig.price * 100,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });
    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      payment_intent: paymentIntent.id,
    });
    await newOrder.save();
    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

const confirm = async (req, res, next) => {
  try {
    await Order.findOneAndUpdate(
      { payment_intent: req.body.payment_intent },
      { $set: { status: "In Progress" } }
    );
    res.status(200).send("Order has been confirmed.");
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return next(createError(404, "Order not found."));
        if (order.sellerId.toString() !== req.userId) {
            return next(createError(403, "You are not authorized to update this order."));
        }
        order.status = req.body.status;
        await order.save();
        res.status(200).send("Order status has been updated.");
    } catch (err) {
        next(err);
    }
};

const checkPurchase = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            gigId: req.params.gigId,
            buyerId: req.userId,
            status: "Completed", 
        });
        res.status(200).send({ purchased: !!order });
    } catch (err) {
        next(err);
    }
};

// ✅ THIS IS THE DEFINITIVE FIX for the getOrders function
const getOrders = async (req, res, next) => {
    try {
        // Log the incoming request details to debug
        console.log(`[getOrders] Fetching orders for user: ${req.userId}, isSeller: ${req.isSeller}`);

        const query = req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId };
        
        // Find all orders for the current user
        const orders = await Order.find(query).lean();

        if (!orders.length) {
            console.log("[getOrders] No orders found for this user.");
            return res.status(200).send([]);
        }

        // Collect the IDs of the other users
        const otherUserIds = [...new Set(orders.map(order => 
            req.isSeller ? order.buyerId : order.sellerId
        ))];

        // Fetch details for all other users in a single query
        const users = await User.find({ _id: { $in: otherUserIds } }).select('username img').lean();

        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user;
            return acc;
        }, {});

        // Manually attach user details to each order
        const populatedOrders = orders.map(order => {
            const otherUserId = req.isSeller ? order.buyerId : order.sellerId;
            const otherUserDetails = userMap[otherUserId];
            
            if (req.isSeller) {
                order.buyerId = otherUserDetails || { username: "N/A" };
            } else {
                order.sellerId = otherUserDetails || { username: "N/A" };
            }
            return order;
        });

        console.log(`[getOrders] Successfully found and populated ${populatedOrders.length} orders.`);
        res.status(200).send(populatedOrders);

    } catch (err) {
        console.error("[getOrders] An error occurred:", err);
        next(err);
    }
};

const getBuyingOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyerId: req.userId })
            .populate("sellerId", "username img"); // Populate seller details

        res.status(200).send(orders);
    } catch (err) {
        next(err);
    }
};


module.exports = {
    intent,
    getOrders,
    confirm,
    updateStatus,
    checkPurchase,
    getBuyingOrders,
};