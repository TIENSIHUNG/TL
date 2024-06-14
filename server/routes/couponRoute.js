const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createCoupon,getAllCoupon, updateCoupon, deleteCoupon} = require ('../controller/couponCtrl');
const router = express.Router();

router.post('/', authMiddleware,isAdmin, createCoupon);
router.put('/:id', authMiddleware,isAdmin,updateCoupon);
router.get('/', getAllCoupon);
router.delete('/:id', authMiddleware,isAdmin,deleteCoupon);


module.exports = router;