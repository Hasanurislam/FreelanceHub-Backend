const Order=require("../Models/OrderModel.js")
const Gig = require("../Models/gigModel.js");
const Stripe =require('stripe');


const intent = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE);

  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found" });

   
    if (gig.userId.toString() === req.userId.toString()) {
      return res.status(403).json({ error: "Sellers cannot order their own gig" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: gig.price * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
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

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error("Error in creating payment intent:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};



const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
      status: { $ne: "Pending" }, // Optionally hide initial pending orders until paid
    }).populate(req.isSeller ? "buyerId" : "sellerId", "username img");

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};



const confirm = async (req, res, next) => {
  try {
    await Order.findOneAndUpdate(
      { payment_intent: req.body.payment_intent },
      { $set: { status: "In Progress" } } // Change status on payment confirmation
    );
    res.status(200).send("Order has been confirmed and is now in progress.");
  } catch (err) {
    next(err);
  }
};


const updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    // Ensure only the seller of this order can update its status
    if (order.sellerId.toString() !== req.userId) {
      return res.status(403).send("You are not authorized to update this order.");
    }

    // Update the status
    order.status = req.body.status;
    await order.save();

    res.status(200).send("Order status has been updated.");
  } catch (err) {
    next(err);
  }
};

const checkPurchase = async (req, res, next) => {
  try {
    console.log(`[Check Purchase] For Gig: ${req.params.gigId}, By User: ${req.userId}`);
    const order = await Order.findOne({
      gigId: req.params.gigId,
      buyerId: req.userId,
      status: "Completed", 
    });

    if (order) {
        console.log("[Check Purchase] Result: Found a completed order.");
    } else {
        console.log("[Check Purchase] Result: No completed order found.");
    }

    res.status(200).send({ purchased: !!order });
  } catch (err) {
    next(err);
  }
};

module.exports={
    intent,
    getOrders,
    confirm,
    updateStatus,
    checkPurchase,

}