const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'todoapp',
  user: process.env.DB_USER || 'todoapp',
  password: process.env.DB_PASSWORD
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/todos', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM todos ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

app.post('/api/todos', async (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Could not create task' });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be true or false' });
  }

  try {
    const result = await db.query(
      'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Could not update task' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM todos WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Could not delete task' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on port ${port}`);
});
