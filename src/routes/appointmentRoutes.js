// File: src/routes/appointmentRoutes.js
import express from 'express';
import { createAppointment, getAppointments } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);

export default router;