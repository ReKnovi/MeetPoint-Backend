// File: src/models/Media.js
import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  mimetype: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;