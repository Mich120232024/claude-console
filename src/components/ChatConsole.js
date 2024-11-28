import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatConsole = ({ chats, activeChat, setActiveChat, setMessages }) => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const startNewChat = () => {
    // Logic to start a new chat
  };

  const sendMessage = () => {
    // Logic to send a message
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-console">
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-button" onClick={startNewChat}>
            + Start new chat
          </button>
        </div>
        <div className="sidebar-content">
          <div className="recent-chats">
            <h2>Recent</h2>
            <div className="chat-list">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChat(chat);
                    setMessages(chat.messages || []);
                    navigate(`/chat/${chat.id}`);
                  }}
                >
                  {chat.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="main-content">
        <button
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="chat-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'user' ? 'You' : 'Claude'}
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <div className="input-container">
          <div className="input-group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatConsole;