const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.post('/api/claude', async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Ensure messages is an array before calling map
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages should be an array' });
    }

    const responses = messages.map(message => {
      // ...existing code...
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ANTHROPIC_API_KEY, // Use the actual API key
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229', // Updated model
        max_tokens: 4096,
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Ensure the messages are strings
    const formattedData = {
      ...data,
      messages: data.messages.map(msg => (typeof msg === 'object' ? JSON.stringify(msg) : msg)),
    };

    res.json(formattedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});