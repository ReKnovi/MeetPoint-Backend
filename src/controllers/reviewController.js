import Review from '../models/Review.js';
import Profile from '../models/Profile.js';
import { HTTP_STATUS } from '../config/constants.js';

// Add a Review
export const addReview = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { rating, comment } = req.body;
    const reviewer = req.user._id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    if (!comment) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Comment is required.'
      });
    }

    // Check if the profile exists
    const profile = await Profile.findById(profileId);
    if (!profile || !profile.isProfessional) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Professional profile not found.'
      });
    }

    // Create the review
    const review = await Review.create({ profile: profileId, reviewer, rating, comment });

    // Update the average rating in the profile
    const reviews = await Review.find({ profile: profileId });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    profile.averageRating = averageRating;
    await profile.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Review added successfully.',
      review
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get Reviews for a Profile
export const getReviews = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Fetch reviews for the profile
    const reviews = await Review.find({ profile: profileId }).populate('reviewer', 'name');
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      reviews,
      averageRating
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};