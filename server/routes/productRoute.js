const express = require('express');
const {createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages,deleteImages} = require('../controller/productCtrl');
const router = express.Router();
const {isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require('../middlewares/uploadimages');

router.post('/',authMiddleware,isAdmin, createProduct);
router.get('/:id', getaProduct);
router.put('/upload', authMiddleware,isAdmin,uploadPhoto.array("images", 10),productImgResize, uploadImages);
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
router.put('/rating', authMiddleware, rating);
router.put('/wishlist', authMiddleware, addToWishlist);


router.get('/', getAllProduct);
router.put('/:id',authMiddleware,isAdmin, updateProduct);
router.delete('/:id',authMiddleware,isAdmin, deleteProduct);


module.exports = router;