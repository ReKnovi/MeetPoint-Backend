import express from 'express';
import { createChatRoom, getChatMessages, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.post('/create', createChatRoom);
router.get('/:chatId/messages', getChatMessages);
router.post('/send', sendMessage);

export default router;