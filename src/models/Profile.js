import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Basic Info (required)
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  
  // Professional Info (optional)
  isProfessional: { type: Boolean, default: false },
  serviceCategory: String,
  specialization: String,
  yearsOfExperience: Number,
  shortBio: String,
  consultationFee: Number,
  documents: {
    idProof: String,
    certifications: [String],
    workLicense: String
  },
  verificationStatus: {
    type: String,
    enum: ['unrequested', 'pending', 'verified', 'rejected'],
    default: 'unrequested'
  },
  
  // Profile Image
  profileImage: String,

  averageRating: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;