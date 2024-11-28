import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatConsole from './components/ChatConsole';
import './App.css';
import PropTypes from 'prop-types';

const App = () => {
  const [chats, setChats] = useState([]); // Initialize chats as an empty array
  const [activeChat, setActiveChat] = useState(null);

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