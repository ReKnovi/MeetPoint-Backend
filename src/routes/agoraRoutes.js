// File: src/routes/agoraRoutes.js
import express from 'express';
import { generateAgoraToken } from '../controllers/agoraController.js';

const router = express.Router();

router.get('/agora/token', generateAgoraToken);

export default router;