// src/components/Dashboard.js

import React, { useState } from 'react';
import ChatConsole from './ChatConsole';

const Dashboard = () => {
    const [activeChat, setActiveChat] = useState(null);

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            {/* Add your dashboard content here */}
            <ChatConsole setActiveChat={setActiveChat} />
        </div>
    );
};

export default Dashboard;