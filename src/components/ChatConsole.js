import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

function ChatConsole() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const navigate = useNavigate();

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setMessages([]);
    navigate(`/chat/${newChat.id}`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          messages: [...messages, newUserMessage]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!activeChat) {
        const newChat = {
          id: Date.now(),
          title: input.slice(0, 30) + '...',
          messages: [...messages, newUserMessage, assistantMessage]
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat);
        navigate(`/chat/${newChat.id}`);
      } else {
        setChats(prev => prev.map(chat =>
          chat.id === activeChat.id
            ? { ...chat, messages: [...messages, newUserMessage, assistantMessage] }
            : chat
        ));
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="app-container">
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
        <header className="main-header">
          <h1>Claude Console</h1>
          <button 
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message Claude..."
              rows={1}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatConsole />} />
        <Route path="/chat/:chatId" element={<ChatConsole />} />
      </Routes>
    </Router>
  );
}

export default App;
