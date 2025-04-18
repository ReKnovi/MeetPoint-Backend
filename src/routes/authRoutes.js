import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  resendVerificationEmail,
  newToken,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', requireAuth, getCurrentUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/', resetPassword);
router.post('/refreshtoken', refreshToken);
router.post('/resend-verification-email', resendVerificationEmail);

router.post('/new-refresh-token', newToken);

export default router;