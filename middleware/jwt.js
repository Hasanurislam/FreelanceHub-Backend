const { createError } = require("../utils/createError");
const jwt=require('jsonwebtoken')
const varifyToken=(req,res,next)=>{
    const token=req.cookies.accessToken;
                 if(!token){
                    return  next(createError(401,"your not authenticated"))
                 }
                 jwt.verify(token,process.env.JWT_SECRET, async(err,payload)=>{
                    if(err) return next(createError(403,"Token is not valid"))
                  req.userId=payload.id;
                  req.isSeller=payload.isSeller;
                  next()
                 });

};

module.exports={
    varifyToken,
}