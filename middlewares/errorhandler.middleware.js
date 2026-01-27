const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    console.log("This error is coming from ErrorHandler.Middleware.js file");

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;