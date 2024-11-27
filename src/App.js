import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug log on component mount
  useEffect(() => {
    console.log('Environment variables:', {
      REACT_APP_ANTHROPIC_API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY?.slice(0, 10) + '...',
      NODE_ENV: process.env.NODE_ENV
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    if (!apiKey) {
      alert('API key not found. Please check your .env file.');
      return;
    }

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          messages: [...messages, newUserMessage]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content[0].text
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error: " + error.message
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div>
      <header>
        <h1>Claude Console</h1>
        <div style={{ fontSize: '12px', color: '#666' }}>
          API Key Status: {process.env.REACT_APP_ANTHROPIC_API_KEY ? 'Present' : 'Missing'}
        </div>
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;