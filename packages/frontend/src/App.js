import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { DateTime } from 'luxon';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');

  /**
   * Calculate the age of an item in days
   * @param {string} createdAt - SQLite timestamp format: "2025-07-03 15:17:11"
   * @returns {number} Age in days
   */
  const calculateAge = createdAt => {
    // Parse SQLite timestamp format as UTC using Luxon
    const itemDate = DateTime.fromSQL(createdAt, { zone: 'utc' });
    const now = DateTime.now();
    const ageInDays = now.diff(itemDate, 'days').days;
    return Math.floor(ageInDays);
  };

  /**
   * Format date for display
   * @param {string} dateString - SQLite timestamp format: "2025-07-03 15:17:11"
   * @returns {string} Formatted date
   */
  const formatDate = dateString => {
    const date = DateTime.fromSQL(dateString, { zone: 'utc' });
    return date.toLocaleString(DateTime.DATE_SHORT);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles deletion of an item
   * Makes API call to DELETE endpoint and updates UI state
   * Handles age restriction errors specifically
   *
   * @param {number} itemId - The ID of the item to delete
   */
  const handleDelete = async itemId => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle age restriction error specifically
        if (response.status === 400 && errorData.itemAge !== undefined) {
          throw new Error(
            `${errorData.error}. Item is ${errorData.itemAge} days old, but must be at least ${errorData.requiredAge} days old.`
          );
        }

        throw new Error(errorData.error || 'Failed to delete item');
      }

      // Remove the item from the local state
      setData(prevData => prevData.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setData([...data, result]);
      setNewItem('');
    } catch (err) {
      setError('Error adding item: ' + err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello World</h1>
        <p>Connected to in-memory database</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Enter item name"
            />
            <button type="submit">Add Item</button>
          </form>
        </section>

        <section className="items-section">
          <h2>Items from Database</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <>
              {data.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Created Date</TableCell>
                        <TableCell>Age (Days)</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map(item => {
                        const age = calculateAge(item.created_at);
                        const canDelete = age >= 5;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>{age}</TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDelete(item.id)}
                                disabled={!canDelete}
                                title={
                                  !canDelete
                                    ? `Item must be at least 5 days old to delete (currently ${age} days old)`
                                    : 'Delete item'
                                }
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <p>No items found. Add some!</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
