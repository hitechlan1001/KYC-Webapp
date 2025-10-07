export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (statusCode, message, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

export const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
};