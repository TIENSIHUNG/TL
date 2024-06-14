const notFound = (req,res,next) =>{
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// const errorHandler = (err,req,res,next) =>{
//     const statusCode = res.statusCode== 200? 500 :res.statusCode;
//     res.status(statusCode);
//     res.json({
//         message: err?.message,
//         stack: err?.stack,
//     });
// };


const errorHandler = (err, req, res, next) => {
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Set status code based on existing or default status code
    const statusCode = res.statusCode === 200 ? 400 : res.statusCode;

    // Set status code and send JSON response
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? '🔥' : err.stack,
    });
};


module.exports = {errorHandler, notFound};