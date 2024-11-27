const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");


const listingController = require("../controllers/listing.js");

// Index Route
router.get("/", wrapAsync (index) );
    

// New Route
router.get("/new", isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id",
     wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
    populate: {
        path:"author",
    },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post(
    "/",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner =req.user._id;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    })
);

// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
     wrapAsync(async (req, res) => {
    let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    })
);

// Update Route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
        let {id} = req.params;
         await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", " Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

// Delete Route
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        console.log("Deleted:", deletedListing);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        res.redirect("/listings");
    }
}));


module.exports = router;