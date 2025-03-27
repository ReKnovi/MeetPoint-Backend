import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/profiles/:profileId/create-reviews', addReview); // Add a review
router.get('/profiles/:profileId/get-reviews', getReviews); // Get all reviews

export default router;