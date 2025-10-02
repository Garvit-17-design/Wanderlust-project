const Listing=require("../models/listing");

module.exports.index=async(req,res)=>{
    let allListings=await Listing.find({});
    res.render("listings/listings",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
 
    res.render("listings/new");
};

module.exports.showListing=async(req,res,next)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author", //  nested populate
    },
  })
  .populate("owner");
    
    if(!listing){
        req.flash("error","The Listing you requested for doesn't exist.");
       return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
};

module.exports.newListing=async(req,res)=>{
  let url=req.file.path;
  let filename=req.file.filename;
        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image={url,filename};
    await newListing.save();
    req.flash("success","Successfully made a new listing");
    res.redirect("/listings");
};

module.exports.editListing=async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit",{listing});
};

module.exports.updateListing=async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id,{...req.body.listing});

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
  let filename=req.file.filename;
 listing.image={url,filename};
  await listing.save();
    }
    // Update only fields that exist in the form
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.image.url = req.body.listing.image;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    await listing.save();
    req.flash("success","Listing updated successfully");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing=async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully");
    res.redirect("/listings");
};