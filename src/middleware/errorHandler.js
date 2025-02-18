const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = {
      success: false,
      message: err.message || 'Internal Server Error',
    };
  
    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      response.message = 'Validation Error';
      response.errors = {};
      Object.keys(err.errors).forEach((key) => {
        response.errors[key] = err.errors[key].message;
      });
      return res.status(400).json(response);
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  
    res.status(statusCode).json(response);
  };
  
  export default errorHandler;