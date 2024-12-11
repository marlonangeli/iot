const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error: ", err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
