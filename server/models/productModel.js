const mongoose = require('mongoose');


const ratingSchema = new mongoose.Schema({
    star: { type: Number, required: true },
    comment: { type: String, required: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  });
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    material:{
        type: String,
        enum: ["Plastic", "Metal", "Acrylic"]
    },
    sold: {
        type: Number,
        default: 0,
    }
    ,
    quantity: Number,
    images: { type: [String], required: true },
    tag:[],
    ratings: [ratingSchema],
    totalrating: {
        type: String,
        default: 0,
    }
},{
    timestamps: true // Enable timestamps (createdAt and updatedAt)
  });

module.exports = mongoose.model("Product", productSchema);