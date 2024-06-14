const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog ,uploadImages} = require('../controller/blogCtrl');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadimages');
const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createBlog);
router.put('/update/:id', authMiddleware, isAdmin, updateBlog);
router.put('/upload/:id', authMiddleware,isAdmin,uploadPhoto.array("images", 2),blogImgResize, uploadImages);
router.get('/:id', getBlog);
router.get('/', getAllBlog);
router.delete('/:id',authMiddleware,isAdmin, deleteBlog);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);

module.exports= router;