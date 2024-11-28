import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatConsole from './components/ChatConsole';
import Dashboard from './components/Dashboard';
import './App.css';

const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="App">
      <Routes>
        {/* Redirect root to /chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* Chat routes */}
        <Route
          path="/chat"
          element={
            <ChatConsole
              chats={chats}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              setMessages={(messages) => {
                if (activeChat) {
                  setChats((prevChats) =>
                    prevChats.map((chat) =>
                      chat.id === activeChat.id ? { ...chat, messages } : chat
                    )
                  );
                }
              }}
            />
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <ChatConsole
              chats={chats}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              setMessages={(messages) => {
                if (activeChat) {
                  setChats((prevChats) =>
                    prevChats.map((chat) =>
                      chat.id === activeChat.id ? { ...chat, messages } : chat
                    )
                  );
                }
              }}
            />
          }
        />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </div>
  );
};

export default App;