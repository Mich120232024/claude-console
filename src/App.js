import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatConsole from './components/ChatConsole';
import './App.css';

const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
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
      </Routes>
    </Router>
  );
};

export default App;