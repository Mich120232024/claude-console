import React, { useState, useEffect } from 'react';
import './App.css';

const ThemeToggle = ({ theme, onToggle }) => (
  <button 
    onClick={onToggle}
    className="theme-toggle"
  >
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
);

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [messages, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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

      setMessages(prev => [
        ...prev, 
        newUserMessage,
        { role: 'assistant', content: data.content[0].text }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Claude Console</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

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
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message... (Shift + Enter for new line)"
            rows={1}
          />
          <button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;