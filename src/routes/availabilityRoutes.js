import express from 'express';
import { setWeeklySchedule, generateWeeklySlots, setUnavailable } from '../controllers/availabilityController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/set-weekly-schedule', requireAuth, setWeeklySchedule);
router.get('/get-availability', requireAuth, generateWeeklySlots);
router.post('/set-unavailable', requireAuth, setUnavailable);

export default router;