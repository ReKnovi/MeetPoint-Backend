import User from '../models/User.js';

export const getUserId = async (req, res) => {
  const { identifier } = req.query;

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Identifier is required' });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveFcmToken = async (req, res) => {
  const { fcmToken } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.status(200).json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};