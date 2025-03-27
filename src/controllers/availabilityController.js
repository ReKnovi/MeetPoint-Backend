import moment from 'moment-timezone';
import Availability from '../models/Availability.js';

export const setWeeklySchedule = async (req, res) => {
  try {
    const { professionalId, schedule, timezone } = req.body;

    // Validate input
    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Missing "professionalId" field.'
      });
    }

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing "schedule" field. It must be an array.'
      });
    }

    // Define all days of the week
    const allDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    // Map the provided schedule to a dictionary for easy lookup
    const scheduleMap = {};
    schedule.forEach((day) => {
      scheduleMap[day.day] = {
        startTime: day.startTime || '00:00', // Use empty string to satisfy schema validation
        endTime: day.endTime || '00:00',     // Use empty string to satisfy schema validation
        isAvailable: day.isAvailable
      };
    });

    // Create a complete schedule with all days
    const completeSchedule = allDays.map((day) => {
      if (scheduleMap[day]) {
        // Use the provided schedule for this day
        return {
          day,
          ...scheduleMap[day]
        };
      } else {
        // Default values for missing days
        return {
          day,
          startTime: '00:00', // Use empty string to satisfy schema validation
          endTime: '00:00',   // Use empty string to satisfy schema validation
          isAvailable: false
        };
      }
    });

    // Delete existing availability for the professional
    await Availability.deleteMany({ professional: professionalId });

    // Insert the complete weekly schedule
    const formattedSchedule = {
      professional: professionalId,
      timezone: timezone || 'UTC',
      schedule: completeSchedule
    };

    await Availability.create(formattedSchedule);

    res.status(201).json({ success:true, message: 'Weekly schedule set successfully!', timezone , schedule: completeSchedule });
  } catch (error) {
    console.error('Error in setWeeklySchedule:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateWeeklySlots = async (req, res) => {
  try {
    const { professionalId } = req.query;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Missing "professionalId" query parameter.'
      });
    }

     const startOfWeek = moment().startOf('week');

    // Fetch the availability for the professional
    const workingHours = await Availability.findOne({ professional: professionalId });

    if (!workingHours || !workingHours.schedule) {
      return res.status(404).json({ success:false, availability: null });
    }

    const schedule = [];

    // Loop through each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      const dayName = currentDay.format('ddd').toLowerCase(); // e.g., "mon", "tue"

      // Find the matching day in the schedule
      const hours = workingHours.schedule.find((d) => d.day === dayName);
      if (hours) {
        schedule.push({
          date: currentDay.format('YYYY-MM-DD'),
          day: hours.day,
          startTime: hours.startTime,
          endTime: hours.endTime,
          isAvailable: hours.isAvailable
        });
      }
    }

    res.status(200).json({ success:true, timezone: workingHours.timezone || 'UTC', schedule });
  } catch (error) {
    console.error('Error in generateWeeklySlots:', error);
    res.status(500).json({ error: error.message });
  }
};

export const setUnavailable = async (req, res) => {
    try {
        const { professionalId, date } = req.body;

        const unavailableDay = new Availability({
            professionalId,
            dayOfWeek: moment(date, "YYYY-MM-DD").format("dddd"),
            isAvailable: false
        });

        await unavailableDay.save();
        res.status(201).json({ message: "Day marked as unavailable!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
