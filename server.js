const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/api/claude', (req, res) => {
  const { messages } = req.body;

  // Simulate a Claude API response
  const assistantMessage = {
    text: "This is a mock response from Claude.",
  };

  res.json({ content: [assistantMessage] });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
