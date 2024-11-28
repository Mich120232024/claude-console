import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ChatConsole from './components/ChatConsole';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Claude Console</h1>
      </header>
      <main className="chat-container">
        <Dashboard />
        <ChatConsole />
      </main>
    </div>
  );
}

export default App;