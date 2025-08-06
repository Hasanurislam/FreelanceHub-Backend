 const User = require('../Models/userModel')
 const jwt=require('jsonwebtoken')
 const Order = require("../Models/OrderModel");
 const Gig = require('../Models/gigModel.js');
 const deleteUser= async (req,res,next)=>{
            
             const user= await User.findById(req.params.id)

    
            
               if(req.userId !== user._id.toString()){
                 return next(403,"you can delete only your account")
               }
             
             await User.findByIdAndDelete(req.params.id);
             res.send('user has been deleted')

         
     

 }
 const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

const becomeSeller = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $set: {
                isSeller: true,
                phone: req.body.phone,
                desc: req.body.desc,
            },
        });
        res.status(200).send("You have successfully become a seller!");
    } catch (err) {
        next(err);
    }
};
const getSellerStats = async (req, res, next) => {
    if (!req.isSeller) {
        return next(createError(403, "You must be a seller to view this information."));
    }
    try {
        // Calculate total earnings from completed orders
        const completedOrders = await Order.find({ sellerId: req.userId, status: "Completed" });
        
        const totalEarnings = completedOrders.reduce((sum, order) => sum + order.price, 0);
        const activeOrdersCount = await Order.countDocuments({ sellerId: req.userId, status: "In Progress" });
        const gigsCount = await Gig.countDocuments({ userId: req.userId });

        res.status(200).send({
            totalEarnings,
            completedOrders: completedOrders.length,
            activeOrders: activeOrdersCount,
            gigs: gigsCount,
            recentTransactions: completedOrders.slice(0, 5) // Send last 5 completed orders as recent transactions
        });
    } catch (err) {
        next(err);
    }
};

 module.exports={
    deleteUser,
    getUser,
    becomeSeller,
    getSellerStats
 }