const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { request } = require('express');

const authMiddleware =asyncHandler(async (req,res,next) => {
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){
                const decoded = jwt.verify(token,process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                request.user = user;
                next();
            
            }
        } catch (error) {
            throw new Error('not authorized');
        }
    }else{
        throw new Error('there no token attached ');
    }

});


const isAdmin = asyncHandler(async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== 'admin'){
        throw new Error('you are not administrator');
    }else{
       next(); 
    }   
});
module.exports = {authMiddleware, isAdmin};