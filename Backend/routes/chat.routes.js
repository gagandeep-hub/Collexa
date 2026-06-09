const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createOrGetConversation,
    getConversations,
    getMessages,
    getUnreadCount
} = require('../controllers/chat.controller');

// All chat routes require authentication
router.use(protect);

// ─── Conversation Routes ──────────────────────────────────────────────────────
router.post('/conversations', createOrGetConversation);   // create or fetch conversation
router.get('/conversations', getConversations);            // inbox - list all

// ─── Message Routes ───────────────────────────────────────────────────────────
router.get('/conversations/:id/messages', getMessages);    // paginated history

// ─── Unread Badge ─────────────────────────────────────────────────────────────
router.get('/unread', getUnreadCount);                     // total unread count

module.exports = router;
