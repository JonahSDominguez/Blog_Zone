const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const POSTS_FILE = path.join(__dirname, 'posts.json');

app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, new_post.html, style.css, posts.json

app.post('/posts', async (req, res) => {
    const post = req.body;
    if (!post || !post.title) return res.status(400).json({ error: 'Invalid post payload' });

    post.date = post.date || new Date().toISOString();

    try {
        let posts = [];
        try {
            const data = await fs.readFile(POSTS_FILE, 'utf8');
            posts = JSON.parse(data);
            if (!Array.isArray(posts)) posts = [];
        } catch {
            posts = [];
        }

        posts.unshift(post);
        await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 4), 'utf8');
        res.status(201).json(post);
    } catch (err) {
        console.error('Failed to save post:', err);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});