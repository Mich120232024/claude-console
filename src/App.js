import React, { useState, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
    setError('');
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) {
      setError('Please enter a message or attach a file');
      return;
    }

    setIsLoading(true);
    setError('');
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const fileContents = await Promise.all(files.map(async (file) => {
        const content = await file.text();
        return { name: file.name, content: content };
      }));

      // Log the API key for debugging (first few characters)
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      console.log('API Key exists:', !!apiKey);
      console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'not found');

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content[0].text
      }]);

    } catch (error) {
      console.error('Error details:', error);
      setError(error.message || 'An error occurred while sending the message');
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
      <h1>Claude Console</h1>
      
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="role">{message.role === 'user' ? 'You' : 'Claude'}</div>
            <div className="content">{message.content}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="input-container">
        {files.length > 0 && (
          <div className="files-list">
            {files.map(file => (
              <div key={file.name} className="file-item">
                <span>{file.name}</span>
                <button onClick={() => removeFile(file.name)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="input-row">
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
};

export default App;