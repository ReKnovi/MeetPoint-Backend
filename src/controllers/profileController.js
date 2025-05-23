import fs from 'fs/promises';
import path from 'path';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Media from '../models/Media.js';
import { HTTP_STATUS } from '../config/constants.js';
import upload from '../config/storage-config.js';
import { setWeeklySchedule } from './availabilityController.js';

export const createProfile = [
  upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'workLicense', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        phone,
        dob,
        address,
        gender,
        isProfessional,
        serviceCategory,
        specialization,
        yearsOfExperience,
        shortBio,
        consultationFee,
        availability
      } = req.body;

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
        gender,
        documents: {}
      };

      if (isProfessional) {
        // Validate required fields for professionals
        if (!serviceCategory || !specialization || !yearsOfExperience || !shortBio || !consultationFee) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Missing required fields for professional profile'
          });
        }

        profileData.isProfessional = isProfessional;
        profileData.serviceCategory = serviceCategory;
        profileData.specialization = specialization;
        profileData.yearsOfExperience = yearsOfExperience;
        profileData.shortBio = shortBio;
        profileData.consultationFee = consultationFee;

        // Validate and set weekly schedule
        if (!availability) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Weekly schedule is required for professional profiles'
          });
        }

        const parsedAvailability = JSON.parse(availability);

        // Call setWeeklySchedule to save the weekly schedule
        const scheduleResponse = await setWeeklySchedule(
          { body: { professionalId: req.user._id, schedule: parsedAvailability } },
          { status: () => ({ json: () => {} }) }
        );

        if (scheduleResponse?.error) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Failed to set weekly schedule'
          });
        }

        profileData.verificationStatus = 'pending';
      }

      // Handle file uploads
      if (req.files['profileImage']) {
        const media = await Media.findOne({ filepath: req.files['profileImage'][0].path });
        profileData.documents.profileImage = media._id;
      }
      if (req.files['idProof']) {
        const media = await Media.findOne({ filepath: req.files['idProof'][0].path });
        profileData.documents.idProof = media._id;
      }
      if (req.files['certifications']) {
        profileData.documents.certifications = await Promise.all(
          req.files['certifications'].map(async (file) => {
            const media = await Media.findOne({ filepath: file.path });
            return media._id;
          })
        );
      }
      if (req.files['workLicense']) {
        const media = await Media.findOne({ filepath: req.files['workLicense'][0].path });
        profileData.documents.workLicense = media._id;
      }

      // Create the profile
      profile = await Profile.create(profileData);

      // Link profile to user
      await User.findByIdAndUpdate(req.user._id, { profile: profile._id });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('Error in createProfile:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
];

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Fetch files associated with the profile
    const files = {};
    if (profile.documents.idProof) {
      const media = await Media.findById(profile.documents.idProof);
      files.idProof = media.filepath;
    }
    if (profile.documents.certifications) {
      files.certifications = await Promise.all(profile.documents.certifications.map(async (id) => {
        const media = await Media.findById(id);
        return media.filepath;
      }));
    }
    if (profile.documents.workLicense) {
      const media = await Media.findById(profile.documents.workLicense);
      files.workLicense = media.filepath;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profile,
      files
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

export const editProfile = [
  upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'workLicense', maxCount: 1 }
  ]),
  async (req, res) => {
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
        gender,
        documents: profile.documents
      };

      if (isProfessional) {
        profileData.isProfessional = true;
        profileData.serviceCategory = serviceCategory;
        profileData.specialization = specialization;
        profileData.yearsOfExperience = yearsOfExperience;
        profileData.shortBio = shortBio;
        profileData.consultationFee = consultationFee;

        if (req.files['idProof']) {
          const media = await Media.findOne({ filepath: req.files['idProof'][0].path });
          profileData.documents.idProof = media._id;
        }

        if (req.files['certifications']) {
          profileData.documents.certifications = await Promise.all(req.files['certifications'].map(async (file) => {
            const media = await Media.findOne({ filepath: file.path });
            return media._id;
          }));
        }

        if (req.files['workLicense']) {
          const media = await Media.findOne({ filepath: req.files['workLicense'][0].path });
          profileData.documents.workLicense = media._id;
        }

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
  }
];

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();

    const profilesWithFiles = profiles.map(profile => {
      const files = {};
      if (profile.documents.idProof) {
        files.idProof = path.join(process.cwd(), profile.documents.idProof);
      }
      if (profile.documents.certifications) {
        files.certifications = profile.documents.certifications.map(certPath => path.join(process.cwd(), certPath));
      }
      if (profile.documents.workLicense) {
        files.workLicense = path.join(process.cwd(), profile.documents.workLicense);
      }
      return { profile, files };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profiles: profilesWithFiles
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

export const searchProfessionalProfiles = async (req, res) => {
  try {
    const filters = req.query;

    let query = Profile.find({ isProfessional: true });

    if (filters.serviceCategory) {
      query = query.where('serviceCategory').equals(filters.serviceCategory);
    }

    if (filters.specialization) {
      query = query.where('specialization').equals(filters.specialization);
    }

    if (filters.consultationFee_min) {
      query = query.where('consultationFee').gte(filters.consultationFee_min);
    }

    if (filters.consultationFee_max) {
      query = query.where('consultationFee').lte(filters.consultationFee_max);
    }

    if (filters.name) {
      query = query.where('name').regex(new RegExp(filters.name, 'i'));
    }

    const profiles = await query.exec();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profiles
    });

  }catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
    const profiles = await Profile.find({ isProfessional: true });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profiles
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}

export const getOneProfessional = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id, isProfessional: true });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Professional not found'
      });
    }

    const files = {};
    if (profile.documents.profileImage) {
      const media = await Media.findById(profile.documents.profileImage);
      files.profileImage = media.filepath;
    }
    if (profile.documents.idProof) {
      const media = await Media.findById(profile.documents.idProof);
      files.idProof = media.filepath;
    }
    if (profile.documents.certifications) {
      files.certifications = await Promise.all(profile.documents.certifications.map(async (id) => {
        const media = await Media.findById(id);
        return media.filepath;
      }));
    }
    if (profile.documents.workLicense) {
      const media = await Media.findById(profile.documents.workLicense);
      files.workLicense = media.filepath;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      profile,
      files
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}