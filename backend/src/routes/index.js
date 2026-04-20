import express from 'express';
import authRoutes from './authRoutes.js';
import imageRoutes from './imageRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/images', imageRoutes);

export default router;
