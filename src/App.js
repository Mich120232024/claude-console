import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        return {
          name: file.name,
          content: content
        };
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
          messages: [
            ...messages,
            newUserMessage
          ],
          system: fileContents.length > 0 ? 
            `The user has provided the following files: ${fileContents.map(f => f.name).join(', ')}. 
             File contents: ${fileContents.map(f => `${f.name}: ${f.content}`).join('\n')}` : 
            undefined
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content[0].text
      }]);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while processing your request');
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
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-800">Claude Console</h1>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-50 ml-16' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="text-sm font-medium mb-1 text-gray-700">
                {message.role === 'user' ? 'You' : 'Claude'}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="border-t border-gray-200 p-4">
          {files.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              {files.map(file => (
                <div key={file.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
            >
              Attach Files
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;