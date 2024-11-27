const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await ListingSchema.find({});
    res.render("listings/index.ejs", { allListings });
};
