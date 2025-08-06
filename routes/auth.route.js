const express = require('express');
const { register,login,logout } = require('../controller/auth.controller');

const router=express.Router();

  router.post('/register',register)
  router.post('/login',login)
  router.post('/logout',logout)





module.exports=router;