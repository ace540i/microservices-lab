const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
  try {
    const response = await fetch('http://backend:5000/messages');
    const messages = await response.json();
    res.send(`<h1>Hello from Frontend!</h1>
              <p>Messages from DB:</p>
              <ul>${messages.map(m => `<li>${m.text}</li>`).join('')}</ul>`);
  } catch (err) {
    res.send(`<h1>Hello from Frontend!</h1><p>Error fetching messages</p>`);
  }
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
