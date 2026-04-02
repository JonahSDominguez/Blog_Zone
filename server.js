// GitHub Pages static hosting - use client-side storage or serverless functions
// Option 1: Use Vercel/Netlify serverless functions (recommended)
// Option 2: Use GitHub API + Actions for POST requests
// Option 3: Use Firebase/Supabase backend

// For local dev with Express:
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const POSTS_FILE = path.join(__dirname, 'posts.json');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, new_post.html, style.css, posts.json

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT,
            author TEXT,
            content TEXT,
            date TIMESTAMP
        )
    `);
}

initDB();

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM posts ORDER BY date DESC'
        );

        res.json(result.rows);
    } catch (err) {
        console.error('GET failed:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});


app.post('/posts', async (req, res) => {
    const { title, author, content } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (title, author, content, date) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [title, author, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST failed:', err);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

// For GitHub Pages deployment, convert endpoints to serverless functions in /api folder
// Example: Create /api/posts.js for Vercel deployment

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});