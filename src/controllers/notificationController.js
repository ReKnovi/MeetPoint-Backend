import { sendPushNotification } from '../services/notificationService.js';
import User from '../models/User.js'; 
import { HTTP_STATUS } from '../config/constants.js';

export const sendNotification = async (req, res) => {
  const { receiverId, title, body, data, options } = req.body;

  try {
    console.log('Received request to send notification:', req.body);
    const user = await User.findById(receiverId);
    if (!user) {
      console.log('User not found:', receiverId);
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    }
    if (!user.fcmToken) {
      console.log('FCM token not found for user:', receiverId);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'FCM token not found' });
    }

    await sendPushNotification(user.fcmToken, title, body, data, options);
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({ error: error.message });
  }
};