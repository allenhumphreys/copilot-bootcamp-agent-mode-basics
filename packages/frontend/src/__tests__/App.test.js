import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { DateTime } from 'luxon';

// Mock fetch globally
global.fetch = jest.fn();

describe('App Component - Delete Functionality with Age Restrictions', () => {
  // Helper function to create SQLite-format timestamps relative to now
  const createSQLiteTimestamp = (daysAgo) => {
    const date = DateTime.now().minus({ days: daysAgo });
    // Format as SQLite timestamp: "YYYY-MM-DD HH:MM:SS"
    return date.toFormat('yyyy-MM-dd HH:mm:ss');
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders old items with enabled delete buttons and allows deletion', async () => {
    // Mock initial data fetch with items that are old enough to delete
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Old Item 1', created_at: createSQLiteTimestamp(10) },
        { id: 2, name: 'Old Item 2', created_at: createSQLiteTimestamp(7) },
      ],
    });

    // Mock delete API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Item deleted successfully' }),
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Old Item 1')).toBeInTheDocument();
    });

    // Check that the table headers are present
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Age (Days)')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check that age is displayed correctly
    expect(screen.getByText('10')).toBeInTheDocument(); // Age for first item
    expect(screen.getByText('7')).toBeInTheDocument(); // Age for second item

    // Assert rendering: Check that delete buttons are present and enabled
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
    expect(deleteButtons[0]).not.toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();

    // Click the first delete button
    fireEvent.click(deleteButtons[0]);

    // Assert API was called: Verify delete API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'DELETE',
      });
    });

    // Assert items are removed: Wait for item to be removed from UI
    await waitFor(() => {
      expect(screen.queryByText('Old Item 1')).not.toBeInTheDocument();
    });

    // Verify the second item is still present
    expect(screen.getByText('Old Item 2')).toBeInTheDocument();
  });

  test('renders new items with disabled delete buttons and shows age restriction', async () => {
    // Mock initial data fetch with items that are too new to delete
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'New Item 1', created_at: createSQLiteTimestamp(0) },
        { id: 2, name: 'New Item 2', created_at: createSQLiteTimestamp(3) },
      ],
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('New Item 1')).toBeInTheDocument();
    });

    // Check that age is displayed correctly
    expect(screen.getByText('0')).toBeInTheDocument(); // Age for first item
    expect(screen.getByText('3')).toBeInTheDocument(); // Age for second item

    // Assert rendering: Check that delete buttons are present but disabled
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).toBeDisabled();

    // Check tooltip text for disabled buttons
    expect(deleteButtons[0]).toHaveAttribute('title', 'Item must be at least 5 days old to delete (currently 0 days old)');
    expect(deleteButtons[1]).toHaveAttribute('title', 'Item must be at least 5 days old to delete (currently 3 days old)');
  });

  test('handles age restriction error from API (edge case where frontend and backend disagree)', async () => {
    // Mock initial data fetch with an item that frontend thinks is 5 days old (borderline case)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Borderline Item', created_at: createSQLiteTimestamp(5) },
      ],
    });

    // Mock age restriction error response (backend says it's not old enough)
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Item must be older than 5 days to delete',
        itemAge: 4,
        requiredAge: 5,
      }),
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Borderline Item')).toBeInTheDocument();
    });

    // The frontend should show this as enabled (age 5)
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).not.toBeDisabled();

    // Click the delete button
    fireEvent.click(deleteButton);

    // Wait for error message to appear from API
    await waitFor(() => {
      expect(screen.getByText(/Item must be older than 5 days to delete. Item is 4 days old, but must be at least 5 days old/)).toBeInTheDocument();
    });
  });

  test.each([
    {
      description: 'displays error message when delete fails',
      mockDeleteError: () => {
        // Mock delete API failure
        fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Failed to delete item' }),
        });
      },
    },
    {
      description: 'handles network error during deletion',
      mockDeleteError: () => {
        // Mock network error
        fetch.mockRejectedValueOnce(new Error('Network error'));
      },
    },
  ])('$description', async ({ mockDeleteError }) => {
    // Mock initial data fetch with old item that should be deletable
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Item 1', created_at: createSQLiteTimestamp(10) }],
    });

    mockDeleteError();

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Click the delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error deleting item/)).toBeInTheDocument();
    });

    // Note: When error occurs, the component shows error state and hides the table
    // So we should not expect the item to still be visible in the table
  });

  test('handles deletion of multiple old items correctly', async () => {
    // Mock initial data fetch with old items that can be deleted
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1', created_at: createSQLiteTimestamp(10) },
        { id: 2, name: 'Test Item 2', created_at: createSQLiteTimestamp(8) },
        { id: 3, name: 'Test Item 3', created_at: createSQLiteTimestamp(6) },
      ],
    });

    // Mock delete API responses
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Item deleted successfully' }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Item deleted successfully' }),
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Verify all buttons are enabled (items are old enough)
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(3);
    deleteButtons.forEach(button => {
      expect(button).not.toBeDisabled();
    });

    // Delete first item
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });

    // Delete second item (now first in the list)
    const remainingDeleteButtons = screen.getAllByText('Delete');
    fireEvent.click(remainingDeleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });

    // Verify only the third item remains
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
    expect(screen.getAllByText('Delete')).toHaveLength(1);
  });
});
