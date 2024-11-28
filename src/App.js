import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ChatConsole from './components/ChatConsole';

function App() {
  const [activeChat, setActiveChat] = useState(null);

  const startNewChat = () => {
    // Logic to start a new chat
    setActiveChat(/* new chat data */);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Claude Console</h1>
      </header>
      <main className="chat-container">
        <Dashboard startNewChat={startNewChat} />
        <ChatConsole activeChat={activeChat} setActiveChat={setActiveChat} />
      </main>
    </div>
  );
}

export default App;