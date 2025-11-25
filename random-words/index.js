// random-words/index.js
const express = require('express');
const app = express();
const PORT = 4000;

// Simple word pool
const words = ["cloud", "docker", "compose", "service", "pipeline", "azure", "react", "postgres", "event", "function"];

app.get('/words', (req, res) => {
  // Pick 5 random words
  const shuffled = words.sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, 5));
});

app.listen(PORT, () => {
  console.log(`Random Words service running on port ${PORT}`);
});
