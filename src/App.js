import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          messages: [...messages, newUserMessage]
        })
      });

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
          <button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;