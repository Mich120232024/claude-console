const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3001; // Ensure this matches the port in setupProxy.js

app.use(cors()); // Enable CORS
app.use(express.json());

app.post("/api/claude", async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
