import express from 'express';
import { getUserId, saveFcmToken } from '../controllers/userController.js';
import {requireAuth, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.get('/get-user-id', requireAuth, checkVerified, getUserId);
router.post('/save-fcm-token', requireAuth, saveFcmToken);

export default router;