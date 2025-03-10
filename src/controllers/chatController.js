// File: src/controllers/chatController.js
import { admin, db } from '../config/firebase.js';

export const createChatRoom = async (req, res) => {
  const { user1, user2 } = req.body;

  if (!user1 || !user2) {
    return res.status(400).json({ success: false, message: 'Both user IDs are required' });
  }

  const chatId = [user1, user2].sort().join('_');

  try {
    await db.collection('chatRooms').doc(chatId).set({
      users: [user1, user2],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ success: true, chatId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messagesSnapshot = await db.collection('chatRooms').doc(chatId).collection('messages').orderBy('timestamp').get();
    const messages = messagesSnapshot.docs.map(doc => doc.data());

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, sender, message } = req.body;

  if (!chatId || !sender || !message) {
    return res.status(400).json({ success: false, message: 'Chat ID, sender, and message are required' });
  }

  try {
    await db.collection('chatRooms').doc(chatId).collection('messages').add({
      sender,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};