/*
2 error handlers:
1. Cloudinary error handler -> catch from cloudinary & multer
2. Global error handler -> catch from all routes
 */
export const cloudinaryErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error('Cloudinary/Multer Error:', err); //remember to comment out if testing

    if (err.name === 'MulterError') {   //file too large
      return res.status(400).json({
        error: 'File upload error',
        message: err.message,
        code: err.code
      });
    }

    if (err.message.includes('File format is not recognized')) {    //zip file is corrupted
      return res.status(400).json({
        error: 'Invalid ZIP file',
        message: 'The uploaded zip file is corrupt or invalid.'
      });
    }

    if (err.message === 'Invalid file type') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, and ZIP files are allowed'
      });
    }

    const statusCode = err.http_code || err.status || 400; //use 400 if error is from user
    if (err.http_code || err.message?.toLowerCase().includes('cloudinary')) {
      return res.status(statusCode).json({
        error: 'Cloudinary storage error',
        message: err.message || 'Error uploading to Cloudinary'
      });
    }

    return res.status(500).json({ //return error like global error handler
      error: 'Upload service failed',
      message: err.message || 'Internal server error'
    });
  }
  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: err.message || 'Server error occurred'
  });
};
