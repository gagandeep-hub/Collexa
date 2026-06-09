import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useChat from '../hooks/useChat';
import './Inbox.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}${avatar}`;
};

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
};

const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatMsgTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Inner chat window used in the right pane ───────────────────────────────
const ChatWindow = ({ conversationId, currentUser }) => {
    const [inputValue, setInputValue] = useState('');
    const { messages, loading, error, isTyping, sendMessage, handleTyping, isClosed, conversation } = useChat({
        conversationId
    });

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isClosed) return;
        sendMessage(trimmed);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const groupedMessages = messages.reduce((groups, msg) => {
        const dateKey = formatDate(msg.createdAt);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(msg);
        return groups;
    }, {});

    return (
        <div className="inbox-chat-window">
            {loading && (
                <div className="inbox-chat-loading">
                    <div className="inbox-spinner" />
                    Loading messages…
                </div>
            )}
            {error && <div className="inbox-chat-error">⚠️ {error}</div>}

            {!loading && !error && (
                <>
                    <div className="inbox-messages">
                        {messages.length === 0 && (
                            <div className="inbox-chat-empty">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}

                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                <div className="inbox-date-divider"><span>{date}</span></div>
                                {msgs.map((msg) => {
                                    const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                                    return (
                                        <div key={msg.id} className={`inbox-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                                            {!isMine && (
                                                <div className="inbox-bubble-avatar">
                                                    {msg.sender?.avatar
                                                        ? <img src={getAvatarUrl(msg.sender.avatar)} alt="" />
                                                        : <span>{msg.sender?.name?.charAt(0).toUpperCase()}</span>
                                                    }
                                                </div>
                                            )}
                                            <div className={`inbox-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                                                <p>{msg.content}</p>
                                                <span className="inbox-time">{formatMsgTime(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="inbox-bubble-row theirs">
                                <div className="inbox-bubble bubble-theirs typing-bubble">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {isClosed ? (
                        <div className="inbox-input-closed">
                            🔒 Chat closed — item sold or reserved
                        </div>
                    ) : (
                        <div className="inbox-input-area">
                            <textarea
                                ref={textareaRef}
                                className="inbox-textarea"
                                value={inputValue}
                                onChange={(e) => { setInputValue(e.target.value); handleTyping(); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message…"
                                rows={1}
                                maxLength={1000}
                            />
                            <button
                                className="inbox-send-btn"
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ─── Main Inbox Page ──────────────────────────────────────────────────────────
import { useRef } from 'react';

const Inbox = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeConvId, setActiveConvId] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await chatAPI.getConversations();
            setConversations(res.data.conversations || []);
            // Auto-select first conversation only on desktop
            if (res.data.conversations?.length > 0 && !activeConvId) {
                if (window.innerWidth > 768) {
                    setActiveConvId(res.data.conversations[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const activeConv = conversations.find(c => c.id === activeConvId);

    const getOtherUser = (conv) => {
        return user?.id === conv.buyerId ? conv.seller : conv.buyer;
    };

    return (
        <div className="inbox-page">
            {/* ── Left Pane: Conversation List ── */}
            <div className={`inbox-sidebar ${activeConvId ? 'hidden-mobile' : ''}`}>
                <div className="inbox-sidebar-header">
                    <h1>Inbox</h1>
                    <span className="inbox-count">{conversations.length}</span>
                </div>

                {loading ? (
                    <div className="inbox-sidebar-loading">
                        <div className="inbox-spinner" />
                        Loading…
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="inbox-sidebar-empty">
                        <p>No chats yet</p>
                        <p>Start a conversation from a product page.</p>
                        <button className="inbox-browse-btn" onClick={() => navigate('/products')}>
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="inbox-conv-list">
                        {conversations.map((conv) => {
                            const other = getOtherUser(conv);
                            const lastMsg = conv.messages?.[0];
                            const isActive = conv.id === activeConvId;

                            return (
                                <div
                                    key={conv.id}
                                    className={`inbox-conv-item ${isActive ? 'active' : ''} ${conv.isClosed ? 'closed' : ''}`}
                                    onClick={() => setActiveConvId(conv.id)}
                                >
                                    {/* Product thumbnail */}
                                    <div className="inbox-conv-thumb">
                                        {conv.product?.images?.[0] ? (
                                            <img src={getImageUrl(conv.product.images[0])} alt={conv.product.title} />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>

                                    <div className="inbox-conv-info">
                                        <div className="inbox-conv-top">
                                            <span className="inbox-conv-name">{other?.name || 'User'}</span>
                                            {lastMsg && (
                                                <span className="inbox-conv-time">
                                                    {formatTime(lastMsg.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="inbox-conv-bottom">
                                            <span className="inbox-conv-product">{conv.product?.title}</span>
                                            {conv.unreadCount > 0 && (
                                                <span className="inbox-unread-badge">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        {lastMsg && (
                                            <p className="inbox-conv-preview">
                                                {lastMsg.senderId === user?.id ? 'You: ' : ''}
                                                {lastMsg.content}
                                            </p>
                                        )}
                                        {conv.isClosed && (
                                            <span className="inbox-closed-tag">🔒 Closed</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Right Pane: Active Chat ── */}
            <div className={`inbox-main ${!activeConvId ? 'hidden-mobile' : ''}`}>
                {!activeConvId ? (
                    <div className="inbox-main-empty">
                        <h2>Select a conversation</h2>
                        <p>Choose a chat from the left to start messaging.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        {activeConv && (
                            <div className="inbox-chat-header">
                                <button 
                                    className="inbox-back-btn mobile-only" 
                                    onClick={() => setActiveConvId(null)}
                                    aria-label="Back to conversations"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <div className="inbox-chat-header-info">
                                    <div className="inbox-header-avatar">
                                        {getOtherUser(activeConv)?.avatar ? (
                                            <img src={getAvatarUrl(getOtherUser(activeConv).avatar)} alt="" />
                                        ) : (
                                            <span>{getOtherUser(activeConv)?.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="inbox-header-name">{getOtherUser(activeConv)?.name}</p>
                                        <p className="inbox-header-product">
                                            {activeConv.product?.title}
                                            {activeConv.isClosed && <span className="inbox-closed-badge"> · Closed</span>}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="inbox-view-product-btn"
                                    onClick={() => navigate(`/products/${activeConv.productId}`)}
                                >
                                    View Product →
                                </button>
                            </div>
                        )}
                        <ChatWindow conversationId={activeConvId} currentUser={user} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Inbox;
