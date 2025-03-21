import express from 'express';
import { setAvailability, getAvailability } from '../controllers/availabilityController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/set-availability', requireAuth, setAvailability);
router.get('/get-availability', requireAuth, getAvailability);

export default router;