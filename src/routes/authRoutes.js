import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', requireAuth, getCurrentUser);
router.get('/verify-email/:token', verifyEmail);
export default router;