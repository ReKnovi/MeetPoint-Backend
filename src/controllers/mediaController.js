// File: src/controllers/mediaController.js
import Media from '../models/Media.js';

export const getFileById = async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};