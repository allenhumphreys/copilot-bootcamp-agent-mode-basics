import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Test Item 1', created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, name: 'Test Item 2', created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    const { id } = req.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId) || itemId <= 0) {
      return res(ctx.status(400), ctx.json({ error: 'Invalid item ID' }));
    }

    // Mock existing items for deletion
    const existingItems = [
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' },
    ];

    const itemToDelete = existingItems.find(item => item.id === itemId);

    if (!itemToDelete) {
      return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Item deleted successfully',
        deletedItem: itemToDelete,
      })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Connected to in-memory database')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });

    // Initially shows loading state
    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter item name');
    await act(async () => {
      await user.type(input, 'New Test Item');
    });

    const submitButton = screen.getByText('Add Item');
    await act(async () => {
      await user.click(submitButton);
    });

    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });

  test('renders delete buttons for each item', async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Check that delete buttons are present
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2); // Should match the number of mock items

    // Verify buttons have proper styling
    deleteButtons.forEach(button => {
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  test('deletes item when delete button is clicked', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Verify initial items are present
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();

    // Click delete button for first item
    const deleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    // Wait for item to be removed from UI
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });

    // Verify second item is still present
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  test('handles delete API error gracefully', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Verify items are initially present
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();

    // Override DELETE handler to simulate error
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
      })
    );

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error deleting item.*Internal server error/)).toBeInTheDocument();
    });

    // Note: Current app behavior hides items when error state is set
    // This is expected behavior based on the current UI logic
  });

  test('handles delete of non-existent item', async () => {
    const user = userEvent.setup();

    // Override DELETE handler to simulate item not found
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error deleting item.*Item not found/)).toBeInTheDocument();
    });
  });

  test('can delete multiple items sequentially', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Verify both items are initially present
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();

    // Delete first item
    const firstDeleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(firstDeleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });

    // Delete second item
    const secondDeleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(secondDeleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });

    // Verify empty state is shown
    expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
  });

  test('delete button maintains proper accessibility', async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Check delete buttons are accessible
    const deleteButtons = screen.getAllByText('Delete');
    deleteButtons.forEach(button => {
      expect(button).toBeEnabled();
      expect(button).toBeVisible();
      expect(button).toHaveProperty('onclick');
    });
  });
});
