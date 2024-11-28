<<<<<<< Tabnine <<<<<<<
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Load chats from localStorage on init
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  // Save chats to localStorage when updated
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]); // Immediately show user message//-

    // Immediately show user message//+
    setMessages(prev => [...prev, newUserMessage]);//+
    try {
      console.log('Sending message:', [...messages, newUserMessage]);//+
      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage]
        })
      });
//-
      const data = await response.json();
      console.log('Received response:', data);//+

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
//-
      // Add assistant's response
      const newAssistantMessage = { role: 'assistant', content: data.content[0].text };//-
      const updatedMessages = [...messages, newUserMessage, newAssistantMessage];//-
      setMessages(updatedMessages);//-
      if (data.content && data.content[0] && data.content[0].text) {//+
        const assistantMessage = {//+
          role: 'assistant',//+
          content: data.content[0].text//+
        };//+

      // Update chat history//-
      if (!activeChat) {//-
        // Create new chat if none is active//-
        const newChat = {//-
          id: Date.now(),//-
          title: input.slice(0, 30) + '...',//-
          messages: updatedMessages//-
        };//-
        setChats(prev => [newChat, ...prev]);//-
        setActiveChat(newChat);//-
        setMessages(prev => [...prev, assistantMessage]);//+
//+
        // Update chat history//+
        const updatedMessages = [...messages, newUserMessage, assistantMessage];//+
//+
        if (!activeChat) {//+
          const newChat = {//+
            id: Date.now(),//+
            title: input.slice(0, 30) + '...',//+
            messages: updatedMessages//+
          };//+
          setChats(prev => [newChat, ...prev]);//+
          setActiveChat(newChat);//+
        } else {//+
          setChats(prev => prev.map(chat => //+
            chat.id === activeChat.id //+
              ? { ...chat, messages: updatedMessages }//+
              : chat//+
          ));//+
        }//+
      } else {
        // Update existing chat//-
        setChats(prev => prev.map(chat => //-
          chat.id === activeChat.id //-
            ? { ...chat, messages: updatedMessages }//-
            : chat//-
        ));//-
        console.error('Invalid response format:', data);//+
        throw new Error('Invalid response from Claude');//+
      }
//-
    } catch (error) {
      console.error('Error:', error);
      // Show error in chat//+
      setMessages(prev => [...prev, {//+
        role: 'assistant',//+
        content: `Error: ${error.message}`//+
      }]);//+
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
                    setMessages(chat.messages);
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

export default App;
>>>>>>> Tabnine >>>>>>>// {"source":"chat"}