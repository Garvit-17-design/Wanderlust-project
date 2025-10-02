const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
// const ExpressError=require("../utils/ExpressError.js");
// const {reviewSchema} = require("../joi.js");
const Review=require("../models/review");
const Listing=require("../models/listing");
const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js");

// const validateReview =(req,res,next)=>{
//  let {error}=reviewSchema.validate(req.body);
   
//    if(error){
//     throw new ExpressError(400,error);
//    } 
// else{
//     next()
// }}

router.post("/", isLoggedIn,validateReview, wrapAsync(async (req, res) => {
    let listing=await Listing.findById(req.params.id);
    const newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Created new review");
    res.redirect(`/listings/${listing._id}`);
}));


router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;