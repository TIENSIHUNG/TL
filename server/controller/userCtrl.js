const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controller/emailCtrl");
const crypto = require("crypto");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const uniqid = require('uniqid');
const mongoose = require('mongoose');

const Order = require("../models/orderModel");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  // Tìm kiếm người dùng trong cơ sở dữ liệu 
  const findUser = await User.findOne({ email: email });

  // Nếu người dùng đã tồn tại, ném một lỗi
  if (findUser) {
    throw new Error("User already Exists");
  }

  // Nếu người dùng chưa tồn tại, tạo mới người dùng và gửi phản hồi thành công
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatch(password))) {
    const refreshToken = await generateRefreshToken(findUser.id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      role: findUser.role,
      token: generateToken(findUser),  // Pass the whole user object
    });
  } else {
    throw new Error("Invalid password");
  }
});

const loginAdminCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find the user with the given email
  const findAdmin = await User.findOne({ email });

  // Check if the user has an admin role
  if (!findAdmin || findAdmin.role !== "admin") throw new Error("Not authorized");

  // Check if the password matches
  if (findAdmin && (await findAdmin.isPasswordMatch(password))) {
    // Generate a refresh token
    const refreshToken = await generateRefreshToken(findAdmin.id);

    // Update the user's refresh token
    const updatedAdmin = await User.findByIdAndUpdate(
      findAdmin.id,
      { refreshToken: refreshToken },
      { new: true }
    );

    // Set the refresh token in a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 72 hours
    });

    // Respond with the user's information and token
    res.json({
      _id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin._id),
    });
  } else {
    throw new Error("Invalid password");
  }
});



const handleRefreshToken = asyncHandler(async (req,res)=>{
    const cookie = req.cookies;
    if(!cookie.refreshToken) throw new Error("No refresh token in cookie");
    const refreshToken  = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("no token present in db or matched!!!");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded)=>{
      if(err||user.id !== decoded.id){
        throw new Error("invalid token");
      }
      const accessToken = generateToken(user?.id);
      res.json({accessToken});
    });
});



const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error("No refresh token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }

  await User.findOneAndUpdate({ refreshToken }, {
    refreshToken: "",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return res.sendStatus(204);
});



const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// const updateaUser = asyncHandler(async (req, res) => {
//   console.log();
//   const { id } = req.user;
//   try {
//     const udateaUser = await User.findByIdAndUpdate(
//       id,
//       {
//         firstname: req?.body?.firstname,
//         lastname: req?.body?.lastname,
//         email: req?.body?.email,
//         mobile: req?.body?.mobile,
//       },
//       { new: true }
//     );
//     res.json(udateaUser);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
const updateaUser = asyncHandler(async (req, res) => {
  // Ensure req.user is defined and contains user information
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id; // Get authenticated user's ID from req.user

  try {
    // Find and update the user document based on userId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        mobile: req.body.mobile,
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser); // Respond with the updated user object
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId();
  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json(deleteaUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId();
  try {
    const getaUser = await User.findById(id);
    res.json(getaUser);
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});



// const updatePassword = asyncHandler(async (req,res)=> {
//   const {_id} = req.user;
//   const password = req.body;
//   validateMongodbId(_id);
//   const user = await User.findById(_id);
//   if (password){
//     user.password = password;
//     const updatedPassword = await User.save();
//     res.json(updatedPassword);
//   }else{
//     res.json(user);
//   }
// })


const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;

  try {
    // Find the user by _id
    const user = await User.findById(_id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password if a new password is provided
    if (password) {
      user.password = password;
      await user.save(); // Save the updated user

      return res.json({ message: 'Password updated successfully' });
    } else {
      return res.status(400).json({ message: 'New password is required' });
    }
  } catch (error) {
    // Handle any errors that occur during user retrieval or password update
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});


const forgotPasswordToken = asyncHandler(async (req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, please follow this link to reset your password. This link will valid till 10 minute from now!!! <a href='http://localhost:5000/api/user/reset-password/${token}'>ClickMe</a>`
    const data = {
      to: email,
      subject: "Forgot password link",
      text:"HEY User",
      htm: resetURL,

    };
     sendEmail(data,req,res);
    
  } catch (error) {
    throw new Error(error);
  }
});



const resetPassword = asyncHandler(async (req, res) => {
  const {password} = req.body;
  const {token} = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if(!user) throw new Error("Token expired");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});


const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;  // Correctly destructuring _id from req.user
  try {
    const findUser = await User.findById(_id).populate('wishlist');  // Assuming you want to populate the wishlist field
    res.json(findUser);  // Responding with the user's wishlist
  } catch (error) {
    res.status(500).json({ message: error.message });  // Returning the error message in the response
  }
});


const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user; 
  validateMongodbId(_id);
  try { 
    const updateUser = await User.findByIdAndUpdate(_id,
      {
        address: req?.body?.address,
      },{
        new: true,
      }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
 
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      object.material = product.material;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});


const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndDelete({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});


const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { phone, address, products, totalAmount } = req.body; // Expect products array and totalAmount directly from the request
  const { _id } = req.user;

  // Validation
  if (!phone || !address || !products || products.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Phone, address, products, and totalAmount are required.' });
  }

  try {
    // Check if all productIds are valid ObjectIds
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: 'Invalid product ID format.' });
      }
    }

    // Create the order with the provided details
    const newOrder = new Order({
      orderby: _id,
      products: products.map(item => ({
        product: new mongoose.Types.ObjectId(item.productId), // Use `new` keyword here
        count: item.count
      })),
      phoneNumber: phone,
      address: address,
      paymentIntent: {
        id: generateUniqueId(),
        method: 'COD', // Assuming COD as default, modify as necessary
        amount: totalAmount,
        status: 'Pending', // Default status, adjust according to your business logic
        created: Date.now(),
        currency: 'vnd',
      },
      orderStatus: 'Not Processed', // Default order status
    });

    await newOrder.save();
    res.json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const userorders = await Order.find({ orderby: _id })  // Use find instead of findOne
      .populate("products.product")
      .populate("orderby")
      .exec();
    if (!userorders || userorders.length === 0) {  // Check if the result is empty
      return res.status(404).json({ message: "No orders found" });
    }
    res.json(userorders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    if (error instanceof DatabaseError) {
      return res.status(500).json({ message: "Database error" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});



const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
   validateMongodbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  updateaUser,
  deleteaUser,
  getaUser, 
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdminCtrl,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus
  
};
