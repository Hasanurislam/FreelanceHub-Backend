const Gig=require('../Models/gigModel');
const {createError} =require('../utils/createError');

const createGig = async (req, res, next) => {
  try {
   /* console.log("REQ BODY:", req.body);
    console.log("REQ USER ID:", req.userId);
    console.log("REQ IS SELLER:", req.isSeller);
    */
    if (!req.isSeller) return next(createError(403, "only sellers can create a gig"));

    const newGig = new Gig({
      userId: req.userId,
      ...req.body,
    });

    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    console.error("Error saving gig:", err); 
    next(err);
  }
};

const deleteGig= async(req,res,next)=>{
      try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};

const getGig= async(req,res,next)=>{
      try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }

}
const getGigs = async (req, res, next) => {
  console.log("✅ /api/gigs called by", req.userId);
  const q = req.query;

  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };

  try {
    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(gigs);
  } catch (err) {
    console.log("❌ Error loading gigs:", err);
    next(err);
  }
};

const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ userId: req.params.userId });
    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};



module.exports={
    createGig,
    deleteGig,
    getGig,
    getGigs,
    getMyGigs,
}