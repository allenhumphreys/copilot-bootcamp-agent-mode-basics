const request = require('supertest');
const { app, db } = require('../src/app');

describe('DELETE /api/items/:id', () => {
  beforeEach(() => {
    // Clean up the database and insert test data with specific dates
    db.exec('DELETE FROM items');

    // Insert items with different ages
    const insertStmt = db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)');

    // Fresh item (created today)
    insertStmt.run('Fresh Item', new Date().toISOString());

    // Old item (created 10 days ago)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    insertStmt.run('Old Item', tenDaysAgo.toISOString());

    // Borderline item (created exactly 5 days ago minus 1 second to ensure it's still within 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setSeconds(fiveDaysAgo.getSeconds() + 1); // Add 1 second to make it slightly less than 5 days old
    insertStmt.run('Borderline Item', fiveDaysAgo.toISOString());
  });

  afterAll(() => {
    // Clean up database after all tests
    db.close();
  });

  it('should successfully delete an old item (older than 5 days)', async () => {
    // Get the old item (created 10 days ago)
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    const oldItem = items.find(item => item.name === 'Old Item');
    expect(oldItem).toBeDefined();

    // Delete the old item
    const response = await request(app).delete(`/api/items/${oldItem.id}`).expect(200);

    expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    expect(response.body).toHaveProperty('deletedItem');
    expect(response.body.deletedItem.id).toBe(oldItem.id);
    expect(response.body.deletedItem.name).toBe(oldItem.name);

    // Verify the item is actually deleted
    const verifyResponse = await request(app).get('/api/items');
    const remainingItems = verifyResponse.body;
    expect(remainingItems).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: oldItem.id })])
    );
  });

  it('should return 400 when trying to delete a fresh item (less than 5 days old)', async () => {
    // Get the fresh item (created today)
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    const freshItem = items.find(item => item.name === 'Fresh Item');
    expect(freshItem).toBeDefined();

    const response = await request(app).delete(`/api/items/${freshItem.id}`).expect(400);

    expect(response.body).toHaveProperty('error', 'Item must be older than 5 days to delete');
    expect(response.body).toHaveProperty('itemAge');
    expect(response.body).toHaveProperty('requiredAge', 5);
    expect(response.body.itemAge).toBeLessThan(5);
  });

  it('should return 400 when trying to delete an item close to 5 days old', async () => {
    // Get the borderline item (created just under 5 days ago)
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    const borderlineItem = items.find(item => item.name === 'Borderline Item');
    expect(borderlineItem).toBeDefined();

    const response = await request(app).delete(`/api/items/${borderlineItem.id}`).expect(400);

    expect(response.body).toHaveProperty('error', 'Item must be older than 5 days to delete');
    expect(response.body).toHaveProperty('itemAge');
    expect(response.body.itemAge).toBeLessThan(5);
    expect(response.body).toHaveProperty('requiredAge', 5);
  });

  it('should return 404 when trying to delete a non-existent item', async () => {
    const nonExistentId = 99999;

    const response = await request(app).delete(`/api/items/${nonExistentId}`).expect(404);

    expect(response.body).toHaveProperty('error', 'Item not found');
  });

  it('should return 400 for invalid item ID (non-numeric)', async () => {
    const response = await request(app).delete('/api/items/invalid-id').expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid item ID');
  });

  it('should return 400 for invalid item ID (negative number)', async () => {
    const response = await request(app).delete('/api/items/-1').expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid item ID');
  });

  it('should handle database errors gracefully', async () => {
    // Mock the database to throw an error
    const mockGet = jest.fn().mockImplementation(() => {
      throw new Error('Database connection error');
    });

    // We need to mock the db.prepare method
    const originalPrepare = db.prepare;
    db.prepare = jest.fn().mockReturnValue({ get: mockGet });

    const response = await request(app).delete('/api/items/1').expect(500);

    expect(response.body).toHaveProperty('error', 'Failed to delete item');

    // Restore the original database
    db.prepare = originalPrepare;
  });

  it('should verify items remain in database when deletion fails due to age', async () => {
    // Get all items
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    expect(items.length).toBe(3);

    // Try to delete fresh item (should fail)
    const freshItem = items.find(item => item.name === 'Fresh Item');
    await request(app).delete(`/api/items/${freshItem.id}`).expect(400);

    // Verify item is still in database
    const verifyResponse = await request(app).get('/api/items');
    const remainingItems = verifyResponse.body;
    expect(remainingItems.length).toBe(3);
    expect(remainingItems.find(item => item.id === freshItem.id)).toBeDefined();
  });
});
