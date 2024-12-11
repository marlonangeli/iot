const notFoundHandler = (req, res, next) => {
    const err = new Error("Not Found");
    err.statusCode = 404;
    next(err);
}

export default notFoundHandler;
