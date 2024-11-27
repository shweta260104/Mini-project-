const express = require("express");
const router = express.Router({ mergeparams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); // Validate req.body direct
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//post Review Route
router.post("/",
    isLoggedIn,
    validateReview, 
    wrapAsync(async(req, res)=> {
    let listing= await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
    
  }));
  
  //Delete Review Route
  router.delete("/:reviewId",
        isLoggedIn,
        isReviewAuthor,
       wrapAsync(async (req, res) => {
          let { id, reviewId } = req.params;
  
          await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
          await Review.findByIdAndDelete(reviewId);
          req.flash("success", " Review Deleted!");
          res.redirect(`/listings/${id}`);
  })
  );

  module.exports =router;