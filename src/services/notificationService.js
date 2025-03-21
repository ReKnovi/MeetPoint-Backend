// File: src/services/notificationService.js
import { admin } from '../config/firebase.js';

export const sendPushNotification = async (token, title, body, data = {}) => {
  // Ensure data is a non-null object and convert all values to strings
  const notificationData = typeof data === 'object' && data !== null
    ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
    : { data: JSON.stringify(data) };

  const message = {
    notification: {
      title,
      body
    },
    data: notificationData,
    token
  };

  try {
    console.log('Sending notification:', message);
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};