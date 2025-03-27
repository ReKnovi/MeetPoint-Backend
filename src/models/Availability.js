import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  professional: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  timezone: {
      type: String,
      default: 'UTC'
    },
  schedule: [{
    day: {
      type: String,
      enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
});

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;