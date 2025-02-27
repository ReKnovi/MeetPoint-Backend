import express from 'express';
import { createProfile, editProfile, getProfile } from '../controllers/profileController.js';
import {requireAuth, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-profile', requireAuth, checkVerified, createProfile);
router.get('/get-profile', requireAuth, checkVerified, getProfile);
router.put('/edit-profile', requireAuth, checkVerified, editProfile);
export default router;