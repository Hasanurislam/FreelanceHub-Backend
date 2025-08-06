const express=require("express") 
const { createConversation, getConversations, updateConversation, getSingleConversation }=require("../controller/conversion.controller.js");
const { varifyToken }=require("../middleware/jwt.js");

const router = express.Router();

router.post("/", varifyToken, createConversation);
router.get("/", varifyToken, getConversations);
router.get("/single/:id", varifyToken, getSingleConversation);
router.put("/:id", varifyToken, updateConversation);

module.exports=router;