import express from 'express';
import loginController from '../controllers/loginController.js';
import registerController from '../controllers/registerController.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);

export default router;
