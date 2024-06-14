const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");
const User = require("../models/userModel");

const fs = require("fs");
const slugify = require("slugify");
const { query } = require("express");
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");
// const createProduct = asyncHandler(async (req, res) => {
//   try {
//     if (req.body.title) {
//       req.body.slug = slugify(req.body.title);
//     }
//     const newProduct = await Product.create(req.body);
//     res.json(newProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
const createProduct = asyncHandler(async (req, res) => {
  const { title, material, price, quantity, description, images } = req.body;

  // Validate incoming data
  if (!title || !material || !price || !quantity || !description || !images || images.length === 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

    // Create a new product
    const newProduct = new Product({
      title,
      slug,
      description,
      price,
      material,
      quantity,
      images
    });

    // Save the product to the database
    await newProduct.save();

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product" });
  }
});


const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const getaProduct = await Product.findById(id);
    res.json(getaProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit); // Default limit if not specified

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build the base query object
    const queryObj = { ...req.query };
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Replace operators for comparison ($gt, $gte, $lt, $lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    // Create the base query using the modified query string
    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // Default sorting by createdAt if sort parameter is not provided
    }

    // Limiting the fields
    if (req.query.fields) {
      const selectedFields = req.query.fields.split(",").join(" ");
      query = query.select(selectedFields);
    } else {
      query = query.select("-__v"); // Exclude the '__v' field by default
    }

    // Pagination
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("page does not exists");
    }

    // Execute the query and send the response
    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { proId } = req.body;

    // Validate MongoDB ObjectID
    validateMongodbId(proId);

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product ID is already in the user's wishlist
    const alreadyAdded = user.wishlist.includes(proId);

    if (alreadyAdded) {
      // Product is already in the wishlist, so remove it
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: proId } });
      // Fetch the updated user after removing the product from the wishlist
      const updatedUser = await User.findById(userId);
      res.json(updatedUser);
    } else {
      // Product is not in the wishlist, so add it
      await User.findByIdAndUpdate(userId, { $push: { wishlist: proId } });
      // Fetch the updated user after adding the product to the wishlist
      const updatedUser = await User.findById(userId);
      res.json(updatedUser);
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(400).json({ message: error.message });
  }
};

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, proId } = req.body;

  try {
    // Validate MongoDB ID
    validateMongodbId(proId);

    // Find the product by ID
    const product = await Product.findById(proId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure ratings is an array
    if (!Array.isArray(product.ratings)) {
      product.ratings = [];
    }

    // Check if the user has already rated the product
    let alreadyRated = product.ratings.find(
      (rating) => rating.postedBy.toString() === _id.toString()
    );

    if (alreadyRated) {
      // Update the existing rating and comment
      alreadyRated.star = star;
      alreadyRated.comment = comment;
    } else {
      // Add a new rating with comment
      product.ratings.push({
        star,
        comment,
        postedBy: _id,
      });
    }

    // Save the product with updated ratings
    await product.save();

    // Calculate the new average rating
    const totalRating = product.ratings.length;
    const ratingSum = product.ratings.reduce(
      (sum, rating) => sum + rating.star,
      0
    );
    const actualRating = Math.round(ratingSum / totalRating);

    // Update the product's average rating
    product.totalrating = actualRating;
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// const uploadImages = asyncHandler(async (req, res) => {
//   try {
//     const uploader = (path) => cloudinaryUploadImg(path, "images");
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const { path } = file;
//       const newpath = await uploader(path);
//       console.log(newpath);
//       urls.push(newpath);
//       // fs.unlinkSync(path);
//     }
//     const images = urls.map((file) => {
//       return file;
//     });
//     res.json(images);
//   } catch (error) {
//     throw new Error(error);
//   }
// });


const uploadImages = asyncHandler(async (files) => {
  const uploader = (path) => cloudinaryUploadImg(path, "images");
  const images = [];

  for (const file of files) {
    const { path } = file;
    const newpath = await uploader(path);
    images.push({
      url: newpath.secure_url,
      public_id: newpath.public_id,
    });
    // fs.unlinkSync(path); // Uncomment if you want to delete the file from the server after uploading
  }

  return images;
});
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    throw new Error(error);
  }
});



module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  deleteImages,
};
