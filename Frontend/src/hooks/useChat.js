import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/api';
import socketService from '../services/socketService';

/**
 * useChat hook
 *
 * Used by both ChatPanel (ProductDetail) and the Inbox page.
 * 
 * @param {string} productId - Pass when opening from ProductDetail (buyer initiates)
 * @param {string} conversationId - Pass directly when opening from Inbox
 */
const useChat = ({ productId = null, conversationId: initialConvId = null } = {}) => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false); // other party typing
    const typingTimerRef = useRef(null);
    const conversationId = conversation?.id || initialConvId;

    // ── Initialize: create/get conversation and load messages ──────────────
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError(null);

                if (productId) {
                    // Buyer flow: upsert conversation from product page
                    const res = await chatAPI.createOrGetConversation(productId);
                    setConversation(res.data.conversation);
                    setMessages(res.data.conversation.messages || []);
                } else if (initialConvId) {
                    // Inbox flow: load messages for an existing conversation
                    const res = await chatAPI.getMessages(initialConvId);
                    setMessages(res.data.messages || []);
                }
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to load chat';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        if (productId || initialConvId) {
            init();
        }
    }, [productId, initialConvId]);

    // ── Connect socket and join room ───────────────────────────────────────
    useEffect(() => {
        if (!conversationId) return;

        const socket = socketService.connect();
        if (!socket) return;

        socketService.joinConversation(conversationId);

        // Listen for new messages
        const handleNewMessage = (message) => {
            if (message.conversationId !== conversationId) return;
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
        };

        // Listen for typing indicator
        const handleTyping = ({ isTyping: typing }) => {
            setIsTyping(typing);
            // Auto-clear typing after 3s in case the stop event is missed
            if (typing) {
                clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socketService.onMessage(handleNewMessage);
        socketService.onTyping(handleTyping);

        return () => {
            socketService.leaveConversation(conversationId);
            socketService.offMessage(handleNewMessage);
            socketService.offTyping(handleTyping);
            clearTimeout(typingTimerRef.current);
        };
    }, [conversationId]);

    // ── Send message ────────────────────────────────────────────────────────
    const sendMessage = useCallback((content) => {
        if (!content?.trim() || !conversationId) return;
        socketService.sendMessage(conversationId, content.trim());
        // Stop typing when message is sent
        socketService.sendTyping(conversationId, false);
    }, [conversationId]);

    // ── Typing indicator ────────────────────────────────────────────────────
    const handleTyping = useCallback(() => {
        if (!conversationId) return;
        socketService.sendTyping(conversationId, true);

        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socketService.sendTyping(conversationId, false);
        }, 2000);
    }, [conversationId]);

    return {
        conversation,
        messages,
        loading,
        error,
        isTyping,
        sendMessage,
        handleTyping,
        isClosed: conversation?.isClosed ?? false
    };
};

export default useChat;
