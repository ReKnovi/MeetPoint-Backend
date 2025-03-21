// File: src/controllers/availabilityController.js
import Availability from '../models/Availability.js';
import { HTTP_STATUS } from '../config/constants.js';

export const setAvailability = async (req, res) => {
  try {
    const { days, exceptions } = req.body;
    const professional = req.user._id;

    const availability = await Availability.findOneAndUpdate(
      { professional },
      { days, exceptions },
      { new: true, upsert: true }
    );

    res.status(HTTP_STATUS.CREATED).json({ success: true, availability });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({ professional: req.user._id });
    res.status(HTTP_STATUS.OK).json({ success: true, availability });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};