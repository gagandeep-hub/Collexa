
const prisma = require('../lib/prisma');

// ─── Create or Get Conversation ───────────────────────────────────────────────
/**
 * POST /api/chat/conversations
 * Buyer initiates a chat on a product. Creates or returns an existing conversation.
 * Blocked if product is sold or reserved.
 */
exports.createOrGetConversation = async (req, res) => {
    try {
        const { productId } = req.body;
        const buyerId = req.user.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        // Fetch product to validate status and get sellerId
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, sellerId: true, status: true, title: true }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Seller cannot chat with themselves
        if (product.sellerId === buyerId) {
            return res.status(400).json({ success: false, message: 'You cannot chat with yourself' });
        }

        // Block chats on sold/reserved products
        if (product.status === 'sold' || product.status === 'reserved') {
            return res.status(403).json({
                success: false,
                message: `This product is ${product.status}. Chat is not available.`
            });
        }

        const includeArgs = {
            product: { select: { id: true, title: true, images: true, status: true } },
            buyer: { select: { id: true, name: true, avatar: true } },
            seller: { select: { id: true, name: true, avatar: true } },
            messages: {
                orderBy: { createdAt: 'asc' },
                take: 50,
                include: {
                    sender: { select: { id: true, name: true, avatar: true } }
                }
            }
        };

        // Try to find existing conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                productId_buyerId: { productId, buyerId }
            },
            include: includeArgs
        });

        // If not found, create a new one
        if (!conversation) {
            try {
                conversation = await prisma.conversation.create({
                    data: {
                        productId,
                        buyerId,
                        sellerId: product.sellerId,
                        isClosed: false
                    },
                    include: includeArgs
                });
            } catch (createErr) {
                // If it was created in a race condition, try to fetch it again
                if (createErr.code === 'P2002') {
                    conversation = await prisma.conversation.findUnique({
                        where: {
                            productId_buyerId: { productId, buyerId }
                        },
                        include: includeArgs
                    });
                } else {
                    throw createErr;
                }
            }
        }

        return res.status(200).json({ success: true, conversation });

    } catch (error) {
        console.error('createOrGetConversation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── Get All Conversations (Inbox) ───────────────────────────────────────────
/**
 * GET /api/chat/conversations
 * Returns all conversations for the logged-in user (as buyer or seller).
 * Includes last message preview and unread count.
 */
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                messages: {
                    some: {} // Only fetch conversations that have at least one message
                }
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                product: { select: { id: true, title: true, images: true, status: true } },
                buyer: { select: { id: true, name: true, avatar: true } },
                seller: { select: { id: true, name: true, avatar: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: { select: { id: true, name: true } }
                    }
                }
            }
        });

        // Attach unread count per conversation
        const withUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        read: false,
                        senderId: { not: userId } // messages sent by the other party
                    }
                });
                return { ...conv, unreadCount };
            })
        );

        return res.status(200).json({ success: true, conversations: withUnread });

    } catch (error) {
        console.error('getConversations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── Get Messages ─────────────────────────────────────────────────────────────
/**
 * GET /api/chat/conversations/:id/messages?page=1
 * Returns paginated messages for a conversation.
 * Also marks unread messages as read.
 */
exports.getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        // Ensure the user is part of this conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { buyerId: true, sellerId: true }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Fetch paginated messages (oldest first)
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            skip,
            take: limit,
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            }
        });

        // Mark all unread messages from the other party as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                read: false,
                senderId: { not: userId }
            },
            data: { read: true }
        });

        return res.status(200).json({ success: true, messages, page });

    } catch (error) {
        console.error('getMessages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── Get Unread Count (for Navbar badge) ─────────────────────────────────────
/**
 * GET /api/chat/unread
 * Returns total unread message count for the logged-in user.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all conversations this user is part of
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }]
            },
            select: { id: true }
        });

        const convIds = conversations.map(c => c.id);

        const unreadCount = await prisma.message.count({
            where: {
                conversationId: { in: convIds },
                read: false,
                senderId: { not: userId }
            }
        });

        return res.status(200).json({ success: true, unreadCount });

    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
