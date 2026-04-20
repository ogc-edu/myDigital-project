import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { imageFilter } from '../middleware/imgFilter.js';
import { uploadImage } from '../controllers/uploadImageController.js';
import { cloudinaryErrorHandler } from '../middleware/errorHandler.js';
import  userImage  from '../controllers/userImage.js';

const router = express.Router();

router.post('/upload', verifyToken, imageFilter, uploadImage, cloudinaryErrorHandler); //upload single image
router.get('/getAll', verifyToken, userImage);

export default router;

