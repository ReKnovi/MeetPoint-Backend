// File: src/controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import { HTTP_STATUS } from '../config/constants.js';

export const createAppointment = async (req, res) => {
  try {
    const { professional, user, service, dateTime, duration } = req.body;

    // Check professional availability
    const availability = await Availability.findOne({ professional });
    if (!availability) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Professional availability not set' });
    }

    const day = new Date(dateTime).toLocaleString('en-us', { weekday: 'short' }).toLowerCase();
    const dayAvailability = availability.days.find(d => d.day === day);
    if (!dayAvailability) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Professional is not available on the selected day' });
    }

    const slotAvailable = dayAvailability.slots.some(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      const appointmentStart = new Date(dateTime);
      const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);
      return slot.available && appointmentStart >= slotStart && appointmentEnd <= slotEnd;
    });

    if (!slotAvailable) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Professional is not available at the selected time' });
    }

    // Check for exceptions
    const exception = availability.exceptions.find(e => new Date(e.date).toDateString() === new Date(dateTime).toDateString());
    if (exception && !exception.available) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: `Professional is not available on ${exception.date} due to ${exception.reason}` });
    }

    const appointment = await Appointment.create({ professional, user, service, dateTime, duration });

    res.status(HTTP_STATUS.CREATED).json({ success: true, appointment });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).populate('professional user');
    res.status(HTTP_STATUS.OK).json({ success: true, appointments });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};