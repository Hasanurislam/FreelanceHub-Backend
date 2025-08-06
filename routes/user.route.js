const express = require('express');
const {
  deleteUser,
  getUser,
  becomeSeller,
  getSellerStats,
} = require('../controller/user.controller.js');
const { varifyToken } = require('../middleware/jwt.js');

const router = express.Router();

router.delete('/:id', varifyToken, deleteUser);

router.get('/:id', getUser);

router.put('/become-seller', varifyToken, becomeSeller);
router.get("/stats/seller", varifyToken, getSellerStats);

module.exports = router;
