import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { HTTP_STATUS } from '../config/constants.js';

export const createProfile = async (req, res) => {
  try {
    const { name, phone, dob, address, gender, isProfessional, serviceCategory, specialization, yearsOfExperience, shortBio, consultationFee } = req.body;

    // Check if profile already exists
    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    const profileData = {
      user: req.user._id,
      name,
      phone,
      dob: new Date(dob),
      address,
      gender
    };

    if (isProfessional) {
      profileData.isProfessional = true;
      profileData.serviceCategory = serviceCategory;
      profileData.specialization = specialization;
      profileData.yearsOfExperience = yearsOfExperience;
      profileData.shortBio = shortBio;
      profileData.consultationFee = consultationFee;
      profileData.documents = {
        idProof: req.files?.idProof?.[0]?.path,
        certifications: req.files?.certifications?.map(f => f.path),
        workLicense: req.files?.workLicense?.[0]?.path
      };
      profileData.verificationStatus = 'pending';
    }

    profile = await Profile.create(profileData);

    // Link profile to user
    await User.findByIdAndUpdate(req.user._id, { profile: profile._id });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      profile
    });

  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { name, phone, dob, address, gender, isProfessional, serviceCategory, specialization, yearsOfExperience, shortBio, consultationFee } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const profileData = {
      name,
      phone,
      dob: new Date(dob),
      address,
      gender
    };

    if (isProfessional) {
      profileData.isProfessional = true;
      profileData.serviceCategory = serviceCategory;
      profileData.specialization = specialization;
      profileData.yearsOfExperience = yearsOfExperience;
      profileData.shortBio = shortBio;
      profileData.consultationFee = consultationFee;
      profileData.documents = {
        idProof: req.files?.idProof?.[0]?.path,
        certifications: req.files?.certifications?.map(f => f.path),
        workLicense: req.files?.workLicense?.[0]?.path
      };
      profileData.verificationStatus = 'pending';
    }

    profile = await Profile.findByIdAndUpdate(profile._id, profileData, { new: true, runValidators: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profile
    });

  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};