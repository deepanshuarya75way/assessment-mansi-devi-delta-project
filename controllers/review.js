const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
 module.exports.createReview=async(req,res,next)=>{
    let listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(new ExpressError(404,"Listing not found")); // FIX
    }

    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();
    req.flash("success", "New review Created");

    return res.redirect(`/listings/${listing._id}`); // FIX
};

module.exports.destroyReview=async(req,res,next)=>{
    let{id,reviewId}=req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        {$pull: {reviews:reviewId}}
    );
    if(!listing){
        return next(new ExpressError(404,"Listing not found")); // FIX
    }
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    return res.redirect(`/listings/${id}`); // FIX
};