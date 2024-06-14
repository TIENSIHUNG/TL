const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
      },
    ],
    title: String,
    phoneNumber: String,
    address: String,
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
      ],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate title
orderSchema.pre('save', async function(next) {
  const Order = mongoose.model("Order", orderSchema);
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  const lastOrderNumber = lastOrder ? parseInt(lastOrder.title.replace('#', '')) : 0;
  this.title = `#${lastOrderNumber + 1}`;
  next();
});

// Export the model
module.exports = mongoose.model("Order", orderSchema);
