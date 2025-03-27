import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }, // Reference to the Profile
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User who wrote the review
  rating: { type: Number, min: 1, max: 5, required: true },                         // Rating between 1 and 5
  comment: { type: String, required: true },                                       // Review comment
  createdAt: { type: Date, default: Date.now }                                     // Timestamp for when the review was created
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;