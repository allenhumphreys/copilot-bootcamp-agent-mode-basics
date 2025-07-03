const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = ['Item 1', 'Item 2', 'Item 3'];
const insertStmt = db.prepare('INSERT INTO items (name) VALUES (?)');

initialItems.forEach(item => {
  insertStmt.run(item);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = insertStmt.run(name);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * DELETE endpoint for removing items by ID
 * Only allows deletion of items older than 5 days
 *
 * @route DELETE /api/items/:id
 * @param {string} id - The ID of the item to delete
 * @returns {Object} Success message with deleted item info or error
 */
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the ID is a valid integer string
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Convert to integer and validate
    const itemId = parseInt(id, 10);
    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Check if item exists first
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if item is old enough to delete (older than 5 days)
    const itemCreatedAt = new Date(existingItem.created_at).getTime();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    const ageInMs = Date.now() - itemCreatedAt;

    if (ageInMs < fiveDaysInMs) {
      const ageInDays = Math.floor(ageInMs / (24 * 60 * 60 * 1000));
      return res.status(400).json({
        error: 'Item must be older than 5 days to delete',
        itemAge: ageInDays,
        requiredAge: 5,
      });
    }

    // Delete the item
    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(itemId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.status(200).json({
      message: 'Item deleted successfully',
      deletedItem: existingItem,
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };
