const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require('fs');

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      next: true,
    });
    res.json(updateBlog);
  } catch (error) {
    throw new Error(error);
  }
});
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id).populate('likes').populate('dislikes');
    const updateviews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(getBlog);
  } catch (error) {
    throw new Error(error);
  }
});
const getAllBlog = asyncHandler(async (req, res) => {
    try {
      const getBlogs = await Blog.find();
      res.json(getBlogs);
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletedBlog = await Blog.findByIdAndDelete(id);
      res.json(deletedBlog);
    } catch (error) {
      throw new Error(error);
    }
  });


  const likeBlog = asyncHandler(async (req, res) => {
    try {
      const { blogId } = req.body;
      validateMongoDbId(blogId);
  
      const blog = await Blog.findById(blogId);
      const loginUserId = req?.user?._id;
  
      if (!blog) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }
  
      const isLiked = blog?.isLiked;
      const alreadyDisliked = blog?.dislikes?.some(
        (userId) => userId?.toString() === loginUserId?.toString()
      );
  
      if (alreadyDisliked) {
        // Remove the user from the dislikes array
        await Blog.findByIdAndUpdate(blogId, {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        }, { new: true });
      }
  
      let updatedBlog;
      if (isLiked) {
        // If already liked, remove the user from the likes array
        updatedBlog = await Blog.findByIdAndUpdate(blogId, {
          $pull: { likes: loginUserId },
          isLiked: false,
        }, { new: true });
      } else {
        // If not liked, add the user to the likes array
        updatedBlog = await Blog.findByIdAndUpdate(blogId, {
          $push: { likes: loginUserId },
          isLiked: true,
        }, { new: true });
      }
  
      res.json(updatedBlog);
    } catch (error) {
      console.error("Error liking blog:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  const dislikeBlog = asyncHandler(async (req, res) => {
    try {
      const { blogId } = req.body;
      validateMongoDbId(blogId);
  
      const blog = await Blog.findById(blogId);
      const loginUserId = req?.user?._id;
  
      if (!blog) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }
  
      const isDisliked = blog?.isDisliked;
      const alreadyLiked = blog?.likes?.some(
        (userId) => userId?.toString() === loginUserId?.toString()
      );
  
      if (alreadyLiked) {
        await Blog.findByIdAndUpdate(blogId, {
          $pull: { likes: loginUserId },
          isLiked: false,
        }, { new: true });
      }
  
      let updatedBlog;
      if (isDisliked) {
        updatedBlog = await Blog.findByIdAndUpdate(blogId, {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        }, { new: true });
      } else {
        updatedBlog = await Blog.findByIdAndUpdate(blogId, {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        }, { new: true });
      }
  
      res.json(updatedBlog);
    } catch (error) {
      console.error("Error disliking blog:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  const uploadImages = asyncHandler(async (req, res) => {
    try {
      const {id} = req.params;
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newpath = await uploader(path);
        console.log(newpath);
        urls.push(newpath);
        fs.unlinkSync(path);
      }
      const findBlog = await Blog.findByIdAndUpdate(id, {
        images: urls.map((file) => {
          return file;
        }),
      },{new:true});
     
      res.json(findBlog);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  
  
  

module.exports = { createBlog, updateBlog,getBlog,getAllBlog,deleteBlog,likeBlog,dislikeBlog,uploadImages };
