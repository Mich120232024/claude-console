import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  // Validate API key on component mount
  useEffect(() => {
    if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
      setError('API key not found. Please check your .env file.');
    }
  }, []);

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

    if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
      setError('API key not found. Please check your .env file.');
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

      console.log('Sending request to Claude API...'); // Debug log
      console.log('API Key exists:', !!process.env.REACT_APP_ANTHROPIC_API_KEY); // Debug log (safe, doesn't expose key)

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
      console.error('Error details:', error); // Debug log
      let errorMessage = 'An error occurred while processing your request.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to Claude API. Please check your internet connection and API key.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your .env file and make sure your API key is correct.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setInput('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const Message = ({ message }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 shadow-sm ${
          message.role === 'user' 
            ? 'bg-blue-50 text-gray-900' 
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="text-sm font-medium mb-1 text-gray-700">
          {message.role === 'user' ? 'You' : 'Claude'}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Claude Console</h1>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden max-w-6xl w-full mx-auto px-6">
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 bg-[#F9FAFB] pt-4 pb-6">
          {files.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {files.map(file => (
                <div key={file.name} className="flex items-center justify-between text-sm py-1">
                  <span className="text-gray-600">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Attach Files
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows="1"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className={`px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors ${
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