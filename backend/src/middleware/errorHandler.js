/**
 * Middleware to handle errors from Cloudinary and Multer.
 * This should be used after routes that involve file uploads.
 */
export const cloudinaryErrorHandler = (err, req, res, next) => {
  if (err) {
    // Check if error is from Multer or Cloudinary
    // multer-storage-cloudinary errors usually come through as standard Error objects
    // with some Cloudinary-specific info if available.
    
    console.error('Cloudinary/Multer Error:', err);

    if (err.name === 'MulterError') {
      return res.status(400).json({
        error: 'File upload error',
        message: err.message,
        code: err.code
      });
    }

    // Cloudinary errors often have a 'http_code' or 'status' or are just passed from the SDK
    const statusCode = err.http_code || err.status || 400; // default to 400 for user-caused upload errors
    if (err.http_code || err.message?.toLowerCase().includes('cloudinary') || err.message?.toLowerCase().includes('format')) {
      return res.status(statusCode).json({
        error: 'Cloudinary storage error',
        message: err.message || 'Error uploading to Cloudinary'
      });
    }

    // Generic error fallback for this middleware
    return res.status(500).json({
      error: 'Upload service failed',
      message: err.message || 'Internal server error'
    });
  }
  next();
};

/**
 * Global application error handler.
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
};
