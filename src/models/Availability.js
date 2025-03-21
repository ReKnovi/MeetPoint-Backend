import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  professional: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  days: [{
    day: {
      type: String,
      enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      required: true
    },
    slots: [{
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      },
      available: {
        type: Boolean,
        default: true
      }
    }]
  }],
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    reason: String,
    available: {
      type: Boolean,
      default: false
    }
  }]
});

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;