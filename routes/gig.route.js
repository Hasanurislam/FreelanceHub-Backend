const express = require('express');
const { varifyToken } = require('../middleware/jwt');
const {
  createGig,
  deleteGig,
  getGig,
  getGigs,
  getMyGigs
} = require('../controller/gig.controller');

const router = express.Router();

router.post("/creategig", varifyToken, createGig);
router.delete("/:id", varifyToken, deleteGig);
router.get("/single/:id", getGig);
router.get("/", getGigs)
router.get("/mygigs/:userId", varifyToken, getMyGigs);

module.exports = router;
