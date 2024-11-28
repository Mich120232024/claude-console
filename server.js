const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
  try {
    console.log('Received request:', {
      messages: req.body.messages
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: req.body.messages
      })
    });
    
    const data = await response.json();
    console.log('Claude response:', data);
    
    if (!response.ok) {
      console.error('Error from Claude API:', data);
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));