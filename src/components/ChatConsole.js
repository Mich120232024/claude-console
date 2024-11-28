import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ChatConsole = ({
  chats = [],
  activeChat = null,
  setActiveChat,
  setMessages: setGlobalMessages,
}) => {
  const [input, setInput] = useState('');
  const [messages, setLocalMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeChat?.messages) {
      setLocalMessages(activeChat.messages);
    } else {
      setLocalMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
    };
    setActiveChat(newChat);
    setLocalMessages([]);
    setGlobalMessages([]);
    navigate(`/chat/${newChat.id}`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...(messages || []), userMessage];
    setLocalMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content || data.completion,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setLocalMessages(finalMessages);
      setGlobalMessages(finalMessages);

      if (activeChat) {
        setActiveChat({
          ...activeChat,
          messages: finalMessages,
          title: activeChat.title || userMessage.content.slice(0, 30),
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`chat-console ${theme}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-button" onClick={startNewChat}>
            + Start new chat
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="sidebar-content">
          <div className="recent-chats">
            <h2>Recent</h2>
            <div className="chat-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChat(chat);
                    setLocalMessages(chat.messages || []);
                    navigate(`/chat/${chat.id}`);
                  }}
                >
                  {chat.title || 'New Chat'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="chat-container">
          {(messages || []).map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'user' ? 'You' : 'Claude'}
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-role">Claude</div>
              <div className="message-content loading">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="error-message">Error: {error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              disabled={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

ChatConsole.propTypes = {
  chats: PropTypes.array,
  activeChat: PropTypes.object,
  setActiveChat: PropTypes.func.isRequired,
  setMessages: PropTypes.func.isRequired,
};

export default ChatConsole;