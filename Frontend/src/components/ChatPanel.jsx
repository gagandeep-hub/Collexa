import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useChat from '../hooks/useChat';
import './ChatPanel.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}${avatar}`;
};

const formatTime = (dateStr) => {
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

const ChatPanel = ({ product, isOpen, onClose }) => {
    const { user } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const { conversation, messages, loading, error, isTyping, sendMessage, handleTyping, isClosed } = useChat({
        productId: product?.id
    });

    const otherUser = conversation
        ? (user?.id === conversation.buyerId ? conversation.seller : conversation.buyer)
        : null;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Focus textarea when panel opens
    useEffect(() => {
        if (isOpen && !isClosed) {
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen, isClosed]);

    const handleSend = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isClosed) return;
        sendMessage(trimmed);
        setInputValue('');
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        handleTyping();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const dateKey = formatDate(msg.createdAt);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(msg);
        return groups;
    }, {});

    return (
        <>
            {/* Backdrop */}
            <div
                className={`chat-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`chat-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Chat Panel">
                {/* Header */}
                <div className="chat-panel-header">
                    <div className="chat-header-info">
                        <div className="chat-avatar">
                            {otherUser?.avatar ? (
                                <img src={getAvatarUrl(otherUser.avatar)} alt={otherUser.name} />
                            ) : (
                                <span>{otherUser?.name?.charAt(0).toUpperCase() || '?'}</span>
                            )}
                            <span className="chat-online-dot" />
                        </div>
                        <div>
                            <p className="chat-other-name">{otherUser?.name || 'Seller'}</p>
                            <p className="chat-product-name">{product?.title}</p>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Closed Banner */}
                {isClosed && (
                    <div className="chat-closed-banner">
                        🔒 This chat is closed — the item has been sold or reserved.
                    </div>
                )}

                {/* Messages Area */}
                <div className="chat-messages">
                    {loading && (
                        <div className="chat-loading">
                            <div className="chat-spinner" />
                            <span>Loading messages…</span>
                        </div>
                    )}

                    {error && (
                        <div className="chat-error">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {!loading && !error && messages.length === 0 && (
                        <div className="chat-empty">
                            <p>No messages yet.</p>
                            <p className="chat-empty-sub">Say hi to start the conversation!</p>
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="chat-date-divider">
                                <span>{date}</span>
                            </div>
                            {msgs.map((msg) => {
                                const isMine = msg.senderId === user?.id || msg.sender?.id === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                                    >
                                        {!isMine && (
                                            <div className="chat-bubble-avatar">
                                                {msg.sender?.avatar ? (
                                                    <img src={getAvatarUrl(msg.sender.avatar)} alt={msg.sender.name} />
                                                ) : (
                                                    <span>{msg.sender?.name?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                                            <p>{msg.content}</p>
                                            <span className="chat-time">{formatTime(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="chat-bubble-row theirs">
                            <div className="chat-bubble bubble-theirs typing-bubble">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`chat-input-area ${isClosed ? 'closed' : ''}`}>
                    {isClosed ? (
                        <div className="chat-input-closed">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Chat closed — item is sold or reserved
                        </div>
                    ) : (
                        <>
                            <textarea
                                ref={textareaRef}
                                className="chat-textarea"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message… (Enter to send)"
                                rows={1}
                                maxLength={1000}
                            />
                            <button
                                className="chat-send-btn"
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                aria-label="Send message"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatPanel;
