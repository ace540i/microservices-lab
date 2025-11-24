const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 5000;

// Configure PostgreSQL connection
const pool = new Pool({
  host: 'db',              // service name from docker-compose.yml
  user: 'labuser',
  password: 'labpass',
  database: 'labdb',
  port: 5432
});

// Simple route to test DB query
app.get('/api', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ message: "Hello from Backend API!", db_time: result.rows[0].current_time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
