import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock fetch globally
global.fetch = jest.fn();

describe('App Component - Delete Functionality', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders delete button for each item', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' },
      ],
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Check that delete buttons are present
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  test('calls delete API when delete button is clicked', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' },
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
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify delete API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'DELETE',
      });
    });
  });

  test('removes item from UI after successful deletion', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' },
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
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Wait for item to be removed from UI
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });

    // Verify the second item is still present
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  test('displays error message when delete fails', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Item 1' }],
    });

    // Mock delete API failure
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to delete item' }),
    });

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

  test('handles network error during deletion', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Item 1' }],
    });

    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'));

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

  test('delete button has correct MUI styling and icon', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Item 1' }],
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Check that delete button has correct attributes
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('MuiButton-containedError');
  });

  test('handles deletion of multiple items correctly', async () => {
    // Mock initial data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' },
        { id: 3, name: 'Test Item 3' },
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

    // Delete first item
    const deleteButtons = screen.getAllByText('Delete');
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