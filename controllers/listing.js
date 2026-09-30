 const Listing=require("../models/listing");

module.exports.index=async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
        path:"author",
    },})
.populate("owner");
 if (!listing) {
        req.flash("error","Listing you requested for does not exist!");
        return  res.redirect("/listings");
    }
   res.render("listings/show.ejs", { listing });
};


module.exports.createListing=async (req, res) => {
   const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;



if(req.files && req.files.length >0){
    newListing.image=req.files.map(file=>({
        url:file.path,
        filename: file.filename,
    }));
}

  await newListing.save();
  if(req.headers["x-upload-mode"]){
    return res.json({ id:newListing._id});
  }
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

        if (!listing) {
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image[0]?.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing=async (req, res, next) => {
        const { id } = req.params;
     const listing= await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true }
        );
        if (!listing) {
            return next(new ExpressError(404, "Listing not found"));
        }
        if(typeof req.file !=="undefined"){
         let url=req.file.path;
         let filename=req.file.filename;
          listing.image={url,filename};
          await listing.save();
        }

        
        req.flash("success", "Listing updated!");
        return res.redirect(`/listings/${id}`);
    };

module.exports.destroyListing=async (req, res, next) => {
        const { id } = req.params;
    
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) {
            return next(new ExpressError(404, "Listing not found"));
        }
    
        req.flash("success", "Listing Deleted");
        return res.redirect("/listings");
    };

    module.exports.uploadImage= async(req,res)=>{
        const {id}=req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            return res.status(404).json({
                success:false,
                message:"Listing not found"
            });
        }
        if(!req.file){
           return res.status(404).json({
                success:false,
                message:"No image uploaded" 
           });
        }
        listing.image.push({
            url:req.file.path,
            filename:req.file.filename
        });
        await listing.save();
        res.json({
            success:true,
            image:{
                url: req.file.path,
                filename:req.file.filename
            }
        });
    };