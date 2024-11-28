import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ChatConsole from './components/ChatConsole';
import './App.css';
import PropTypes from 'prop-types';

const App = () => {
  const [chats, setChats] = useState([]); // Initialize chats as an empty array
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

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
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.messages[0].content // Ensure the correct path to access the content
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      if (!activeChat) {
        const newChat = {
          id: Date.now(),
          title: input.slice(0, 30) + '...',
          messages: finalMessages
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat);
        navigate(`/chat/${newChat.id}`);
      } else {
        setChats(prev => prev.map(chat =>
          chat.id === activeChat.id
            ? { ...chat, messages: finalMessages }
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
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={
          <ChatConsole
            chats={chats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            setMessages={(messages) => {
              // Update the chats state with new messages
              if (activeChat) {
                setChats((prevChats) =>
                  prevChats.map((chat) =>
                    chat.id === activeChat.id ? { ...chat, messages } : chat
                  )
                );
              }
            }}
          />
        } />
        <Route path="/chat/:chatId" element={
          <ChatConsole
            chats={chats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            setMessages={(messages) => {
              // Update the chats state with new messages
              if (activeChat) {
                setChats((prevChats) =>
                  prevChats.map((chat) =>
                    chat.id === activeChat.id ? { ...chat, messages } : chat
                  )
                );
              }
            }}
          />
        } />
      </Routes>
    </Router>
  );
};

ChatConsole.propTypes = {
  chats: PropTypes.array,
  activeChat: PropTypes.object,
  setActiveChat: PropTypes.func.isRequired,
  setMessages: PropTypes.func.isRequired,
};

ChatConsole.defaultProps = {
  chats: [],
};

export default App;