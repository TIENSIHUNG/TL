const express = require('express');
const {createUser, loginUserCtrl, getAllUser, updateaUser, deleteaUser, getaUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword , forgotPasswordToken, resetPassword, loginAdminCtrl, getWishlist, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, getAllOrders, updateOrderStatus} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();



router.post('/register', createUser);

router.post('/login', loginUserCtrl);
router.put('/password',authMiddleware, updatePassword);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/wishlist', authMiddleware, getWishlist);
router.put('/save-address' , authMiddleware, saveAddress);
router.post('/cart', authMiddleware, userCart);
router.get('/cart', authMiddleware, getUserCart);
router.post('/cart/cash-order', authMiddleware, createOrder);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.post('/apply-coupon', authMiddleware, applyCoupon);
router.get('/get-order', authMiddleware, getOrders);
router.get('/get-all-orders', authMiddleware , getAllOrders);
router.put('/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);

router.post('/login-admin', loginAdminCtrl);

router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', authMiddleware,resetPassword);

router.get('/all-users', getAllUser);
router.get('/:id',authMiddleware,isAdmin, getaUser);
router.delete('/:id', deleteaUser);
router.put('/edit-user',authMiddleware, updateaUser);
router.put('/block-user/:id',authMiddleware,isAdmin, blockUser);
router.put('/unblock-user/:id',authMiddleware,isAdmin, unblockUser);

module.exports = router;

