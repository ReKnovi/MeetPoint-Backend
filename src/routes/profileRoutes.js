import express from 'express';
import { createProfile, editProfile, getProfile, getAllProfiles, searchProfessionalProfiles, getAllProfessionals, getOneProfessional } from '../controllers/profileController.js';
import {requireAuth, checkVerified } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-profile', requireAuth, checkVerified, createProfile);
router.get('/get-profile', requireAuth, checkVerified, getProfile);
router.put('/edit-profile', requireAuth, checkVerified, editProfile);
router.get('/get-all-profile', requireAuth, checkVerified, getAllProfiles);
router.get('/search-professionals', requireAuth, checkVerified, searchProfessionalProfiles);
router.get('/get-all-professionals', requireAuth, checkVerified, getAllProfessionals);
router.get('/get-one-professional/:id', requireAuth, checkVerified, getOneProfessional);
export default router;