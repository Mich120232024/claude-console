import React, { useState, useEffect } from 'react';
import './App.css';

const Sidebar = ({ chats, onChatSelect, activeChat }) => (
  <div className="sidebar">
    <div className="sidebar-header">
      <button className="new-chat-button">+ Start new chat</button>
    </div>
    <div className="sidebar-content">
      <div className="recent-chats">
        <h2>Recent</h2>
        <div className="chat-list">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Header = ({ theme, onToggleTheme }) => (
  <header className="main-header">
    <h1>Claude Console</h1>
    <div className="header-controls">
      <button 
        className="theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </header>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    
    try {
      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const newMessages = [
        ...messages,
        newUserMessage,
        { role: 'assistant', content: data.content[0].text }
      ];

      setMessages(newMessages);

      // Create new chat if this is the first message
      if (messages.length === 0) {
        const newChat = {
          id: Date.now(),
          title: input.slice(0, 30) + '...',
          messages: newMessages
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
      />
      <main className="main-content">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <div className="chat-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">{message.role === 'user' ? 'You' : 'Claude'}</div>
              <div className="message-content">{message.content}</div>
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
              disabled={isLoading}
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

export default App;