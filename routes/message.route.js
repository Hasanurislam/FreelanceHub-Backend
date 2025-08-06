const express=require("express") 
const { createMessage, getMessages }=require("../controller/message.controller.js");
const { varifyToken }=require("../middleware/jwt.js");

const router = express.Router();

router.post("/", varifyToken, createMessage);
router.get("/:id", varifyToken, getMessages);

module.exports=router;