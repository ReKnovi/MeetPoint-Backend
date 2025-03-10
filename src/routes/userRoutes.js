import express from 'express';
import { getUserId } from '../controllers/userController.js';
import {requireAuth, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.get('/get-user-id', requireAuth, checkVerified, getUserId);

export default router;