import express from 'express';
import loginController from '../controllers/loginController.js';
import registerController from '../controllers/registerController.js';
import logoutController from '../controllers/logoutController.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);

export default router;
