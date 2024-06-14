const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const {notFound, errorHandler} = require('./middlewares/errorHandler');
const PORT = process.env.PORT || 5000;
const dbConnect = require("./config/dbConnect")
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const cors = require('cors');
const blogRouter = require("./routes/blogRoute");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

dbConnect(); 

app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from your frontend
  credentials: true,               // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(morgan("dev"));
app.use(bodyParser.json()); // Parse incoming JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));



app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use('/api/blogcategory', blogcategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/color', colorRouter);
app.use('/api/enquiry', enqRouter);
app.use(notFound);
app.use(errorHandler);
app.get('/serviceWorker.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'serviceWorker.js'));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
