import express from 'express';
import { createAppointment, getAppointments } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/set-appointments', requireAuth, createAppointment);
router.get('/get-appointments', requireAuth, getAppointments);

export default router;