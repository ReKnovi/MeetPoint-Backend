// File: src/controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../config/constants.js';
import moment from 'moment-timezone';

export const createAppointment = async (req, res) => {
  try {
    const { professional, service, dateTime, duration } = req.body;
    console.log('Creating appointment:', req.body.user);

    const user = req.user._id;

    // Check professional availability
    const availability = await Availability.findOne({ professional });
    if (!availability) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Professional availability not set'
      });
    }

    if (!availability.schedule || !Array.isArray(availability.schedule)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Professional schedule is not properly configured'
      });
    }

    // Parse the dateTime and extract the user's timezone
    const userTimezone = moment.tz.guess(); // Guess the user's timezone
    const appointmentMoment = moment.tz(dateTime, userTimezone); // Parse the dateTime with the user's timezone

    if (!appointmentMoment.isValid()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid dateTime format. Please use ISO 8601 format.'
      });
    }

    const appointmentTime = appointmentMoment.format('HH:mm'); // Extract the time in HH:mm format
    console.log('Appointment time:', appointmentTime);
    console.log('User timezone:', userTimezone);

    // Get the day of the week from the appointment date
    const day = appointmentMoment.format('ddd').toLowerCase(); // e.g., "mon", "tue"
    console.log('Day:', day);

    // Find the day's schedule
    const daySchedule = availability.schedule.find((d) => d.day === day);
    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Professional is not available on the selected day'
      });
    }

    // Convert the professional's availability times to the user's timezone
    const scheduleStart = moment.tz(
      `${appointmentMoment.format('YYYY-MM-DD')} ${daySchedule.startTime}`,
      'YYYY-MM-DD HH:mm',
      daySchedule.timezone
    ).tz(userTimezone);

    const scheduleEnd = moment.tz(
      `${appointmentMoment.format('YYYY-MM-DD')} ${daySchedule.endTime}`,
      'YYYY-MM-DD HH:mm',
      daySchedule.timezone
    ).tz(userTimezone);

    console.log('Schedule start (user timezone):', scheduleStart.format());
    console.log('Schedule end (user timezone):', scheduleEnd.format());

    // Validate the time slot
    const appointmentStart = appointmentMoment;
    const appointmentEnd = appointmentMoment.clone().add(duration, 'minutes');

    if (appointmentStart.isBefore(scheduleStart) || appointmentEnd.isAfter(scheduleEnd)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Professional is not available at the selected time'
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({ professional, user, service, dateTime, duration });

    res.status(HTTP_STATUS.CREATED).json({ success: true, appointment });
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id });
    res.status(HTTP_STATUS.OK).json({ success: true, appointments });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};