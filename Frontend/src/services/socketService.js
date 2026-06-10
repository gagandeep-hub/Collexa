import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (import.meta.env.DEV ? 'http://localhost:5000' : 'https://collexa-backend-c7cu.onrender.com');

let socket = null;
let activeConversationId = null;

/**
 * Connects to the Socket.io server with the user's JWT token.
 * Idempotent — calling connect() multiple times is safe.
 */
const connect = () => {
    if (socket?.connected) return socket;

    const token = localStorage.getItem('token');
    if (!token) return null;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('🔌 Socket.io connected:', socket.id);
        if (activeConversationId) {
            socket.emit('join_conversation', { conversationId: activeConversationId });
        }
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.io disconnected:', reason);
    });

    return socket;
};

/**
 * Disconnects from the Socket.io server.
 */
const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        activeConversationId = null;
    }
};

/**
 * Returns the current socket instance (or null if not connected).
 */
const getSocket = () => socket;

/**
 * Joins a conversation room.
 */
const joinConversation = (conversationId) => {
    activeConversationId = conversationId;
    if (!socket) return;
    socket.emit('join_conversation', { conversationId });
};

/**
 * Leaves a conversation room.
 */
const leaveConversation = (conversationId) => {
    if (activeConversationId === conversationId) {
        activeConversationId = null;
    }
    if (!socket) return;
    socket.emit('leave_conversation', { conversationId });
};

/**
 * Sends a message to a conversation room.
 */
const sendMessage = (conversationId, content) => {
    if (!socket) return;
    socket.emit('send_message', { conversationId, content });
};

/**
 * Emits a typing indicator.
 */
const sendTyping = (conversationId, isTyping) => {
    if (!socket) return;
    socket.emit('typing', { conversationId, isTyping });
};

/**
 * Registers a callback for new messages.
 */
const onMessage = (callback) => {
    if (!socket) return;
    socket.on('new_message', callback);
};

/**
 * Removes the new_message listener.
 */
const offMessage = (callback) => {
    if (!socket) return;
    socket.off('new_message', callback);
};

/**
 * Registers a callback for typing events.
 */
const onTyping = (callback) => {
    if (!socket) return;
    socket.on('user_typing', callback);
};

/**
 * Removes the user_typing listener.
 */
const offTyping = (callback) => {
    if (!socket) return;
    socket.off('user_typing', callback);
};

const socketService = {
    connect,
    disconnect,
    getSocket,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    onMessage,
    offMessage,
    onTyping,
    offTyping
};

export default socketService;
