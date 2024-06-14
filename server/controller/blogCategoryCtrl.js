const BlogCategory = require('../models/blogCatModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlogCategory = asyncHandler(async (req, res) => {
    try {
        const newBlogCategory = await BlogCategory.create(req.body);
        res.json(newBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const updateBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
            next: true,
        });
        res.json(updatedBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
}); 

const deleteBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
        res.json(deletedBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getBlogCategory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getBlogCategory = await BlogCategory.findById(id);
        res.json(getBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
});


const getAllBlogCategory = asyncHandler(async(req,res)=>{
    try {
        const getAllBlogCategory = await BlogCategory.find();
        res.json(getAllBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {createBlogCategory,updateBlogCategory,deleteBlogCategory,getBlogCategory,getAllBlogCategory};