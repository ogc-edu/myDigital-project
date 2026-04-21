import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

const uploadMiddleware = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/zip', 'application/x-zip-compressed'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
}

//middleware, check if file size smaller than 10Mb
//fileFilter: uploadMiddleware = check if file type is allowed by uploadMiddleware
export const imageFilter = multer({
  storage, fileFilter: uploadMiddleware, limits: { fileSize: 10 * 1024 * 1024 }
}).single('image');
