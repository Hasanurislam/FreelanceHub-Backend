const User = require('../Models/userModel')
const bcrypt =require('bcrypt')
const jwt =require('jsonwebtoken');
const { createError } = require('../utils/createError');

const register= async (req,res,next)=>{
      try{
        const hash=bcrypt.hashSync(req.body.password,5);
          const newUser= new User({
            ...req.body,
            password:hash
          })
          await newUser.save();
          res.status(201).send('new user created');
      }
      catch(error){
            next(error)
      }

}

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) {
      return res.status(400).send("Wrong username or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_SECRET
    );

    const { password, ...info } = user._doc;

 
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "None", 
        secure: true,     
      })
      .status(200)
      .send(info);
  } catch (error) {
    next(error); 
  }
};
const logout=(req,res)=>{
  res.clearCookie("accessToken"
    ,{
      sameSite:"none",
      secure:true,
     }
  ).status(200).send("User has been logout.")

}


module.exports={
    register,
    login,
    logout
}