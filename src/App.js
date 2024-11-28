import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatConsole from './components/ChatConsole';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatConsole />} />
        <Route path="/chat/:chatId" element={<ChatConsole />} />
      </Routes>
    </Router>
  );
}

export default App;