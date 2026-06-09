const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * Initializes the Socket.io chat handler.
 * All events are scoped to conversation rooms: "conv_<conversationId>"
 */
const initChatSocket = (io) => {

    // ─── JWT Auth Middleware for Sockets ─────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, name: true, avatar: true }
            });

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user; // attach user to socket
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // ─── Connection ───────────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);

        // ── Join a conversation room ──────────────────────────────────────────
        socket.on('join_conversation', async ({ conversationId }) => {
            try {
                // Verify the user belongs to this conversation
                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { buyerId: true, sellerId: true }
                });

                if (!conversation) {
                    return socket.emit('error', { message: 'Conversation not found' });
                }

                const userId = socket.user.id;
                if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                const room = `conv_${conversationId}`;
                socket.join(room);
                console.log(`📥 ${socket.user.name} joined room: ${room}`);

                // Mark messages from the other party as read
                await prisma.message.updateMany({
                    where: {
                        conversationId,
                        read: false,
                        senderId: { not: userId }
                    },
                    data: { read: true }
                });

                socket.emit('joined_conversation', { conversationId, room });

            } catch (err) {
                console.error('join_conversation error:', err);
                socket.emit('error', { message: 'Could not join conversation' });
            }
        });

        // ── Send a message ────────────────────────────────────────────────────
        socket.on('send_message', async ({ conversationId, content }) => {
            try {
                if (!content?.trim()) return;

                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { buyerId: true, sellerId: true, isClosed: true }
                });

                if (!conversation) {
                    return socket.emit('error', { message: 'Conversation not found' });
                }

                // Block messages in closed chats
                if (conversation.isClosed) {
                    return socket.emit('error', { message: 'This chat is closed because the item is sold.' });
                }

                const userId = socket.user.id;
                if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                // Save message to database
                const message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId: userId,
                        content: content.trim()
                    },
                    include: {
                        sender: { select: { id: true, name: true, avatar: true } }
                    }
                });

                // Touch conversation updatedAt for sorting in inbox
                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                });

                // Broadcast to all sockets in the room
                const room = `conv_${conversationId}`;
                io.to(room).emit('new_message', message);

            } catch (err) {
                console.error('send_message error:', err);
                socket.emit('error', { message: 'Could not send message' });
            }
        });

        // ── Typing indicator ──────────────────────────────────────────────────
        socket.on('typing', ({ conversationId, isTyping }) => {
            const room = `conv_${conversationId}`;
            // Broadcast to everyone else in the room
            socket.to(room).emit('user_typing', {
                userId: socket.user.id,
                name: socket.user.name,
                isTyping
            });
        });

        // ── Disconnect ────────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.user?.name} (${socket.id})`);
        });
    });
};

module.exports = initChatSocket;
