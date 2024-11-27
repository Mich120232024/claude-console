// src/App.js
import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      console.log('Sending request with API key:', process.env.REACT_APP_ANTHROPIC_API_KEY?.substring(0, 10) + '...');
      
      const fileContents = await Promise.all(files.map(async (file) => {
        const content = await file.text();
        return { name: file.name, content: content };
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4096,
          messages: [...messages, newUserMessage],
          system: fileContents.length > 0 ? 
            `The user has provided the following files: ${fileContents.map(f => f.name).join(', ')}. 
             File contents: ${fileContents.map(f => `${f.name}: ${f.content}`).join('\n')}` : 
            undefined
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from Claude');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content[0].text
      }]);

    } catch (error) {
      console.error('Error details:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again or check the console for details."
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        {files.length > 0 && (
          <div className="file-list">
            {files.map(file => (
              <div key={file.name} className="file-item">
                <span>{file.name}</span>
                <button onClick={() => removeFile(file.name)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="input-group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()}>
            Attach Files
          </button>
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