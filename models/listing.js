
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review=require("./review.js");


const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: String,
    url: { type: String, default: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" }
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type:Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User",
  },
  
});


listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
await review.deleteMany({_id : {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
