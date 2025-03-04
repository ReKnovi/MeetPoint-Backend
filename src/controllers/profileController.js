import fs from 'fs/promises';
import path from 'path';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { HTTP_STATUS } from '../config/constants.js';
import upload from '../config/storage-config.js';

export const createProfile = [
  upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'workLicense', maxCount: 1 }
  ]),
  async (req, res) => {
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
        gender,
        documents: {}
      };

      if (isProfessional) {
        profileData.isProfessional = true;
        profileData.serviceCategory = serviceCategory;
        profileData.specialization = specialization;
        profileData.yearsOfExperience = yearsOfExperience;
        profileData.shortBio = shortBio;
        profileData.consultationFee = consultationFee;

        if (req.files['idProof']) {
          profileData.documents.idProof = req.files['idProof'][0].key || req.files['idProof'][0].path;
        }

        if (req.files['certifications']) {
          profileData.documents.certifications = req.files['certifications'].map(file => file.key || file.path);
        }

        if (req.files['workLicense']) {
          profileData.documents.workLicense = req.files['workLicense'][0].key || req.files['workLicense'][0].path;
        }

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
      files.idProof = path.join(process.cwd(), profile.documents.idProof);
    }
     if (profile.documents.certifications) {
      files.certifications = profile.documents.certifications.map(certPath => path.join(process.cwd(), certPath));
    }
    if (profile.documents.workLicense) {
      files.workLicense = path.join(process.cwd(), profile.documents.workLicense);
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
          profileData.documents.idProof = req.files['idProof'][0].key || req.files['idProof'][0].path;
        }

        if (req.files['certifications']) {
          profileData.documents.certifications = req.files['certifications'].map(file => file.key || file.path);
        }

        if (req.files['workLicense']) {
          profileData.documents.workLicense = req.files['workLicense'][0].key || req.files['workLicense'][0].path;
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