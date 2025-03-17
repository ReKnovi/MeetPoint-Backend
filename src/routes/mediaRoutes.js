// File: src/routes/mediaRoutes.js
import express from 'express';
import { getFileById } from '../controllers/mediaController.js';

const router = express.Router();

router.get('/media/:id', getFileById);

export default router;