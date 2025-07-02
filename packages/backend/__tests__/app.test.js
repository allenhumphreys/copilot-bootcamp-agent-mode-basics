const request = require('supertest');
const { app, db } = require('../src/app');

describe('DELETE /api/items/:id', () => {
  beforeEach(() => {
    // Clean up the database and insert fresh test data
    db.exec('DELETE FROM items');
    const insertStmt = db.prepare('INSERT INTO items (name) VALUES (?)');
    insertStmt.run('Test Item 1');
    insertStmt.run('Test Item 2'); 
    insertStmt.run('Test Item 3');
  });

  afterAll(() => {
    // Clean up database after all tests
    db.close();
  });

  it('should successfully delete an existing item', async () => {
    // First, get an existing item to delete
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    expect(items.length).toBeGreaterThan(0);
    
    const itemToDelete = items[0];
    
    // Delete the item
    const response = await request(app)
      .delete(`/api/items/${itemToDelete.id}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    expect(response.body).toHaveProperty('deletedItem');
    expect(response.body.deletedItem.id).toBe(itemToDelete.id);
    expect(response.body.deletedItem.name).toBe(itemToDelete.name);

    // Verify the item is actually deleted
    const verifyResponse = await request(app).get('/api/items');
    const remainingItems = verifyResponse.body;
    expect(remainingItems).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: itemToDelete.id })
      ])
    );
    expect(remainingItems.length).toBe(items.length - 1);
  });

  it('should return 404 when trying to delete a non-existent item', async () => {
    const nonExistentId = 99999;
    
    const response = await request(app)
      .delete(`/api/items/${nonExistentId}`)
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Item not found');
  });

  it('should return 400 for invalid item ID (non-numeric)', async () => {
    const response = await request(app)
      .delete('/api/items/invalid-id')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid item ID');
  });

  it('should return 400 for invalid item ID (negative number)', async () => {
    const response = await request(app)
      .delete('/api/items/-1')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid item ID');
  });

  it('should return 400 for invalid item ID (zero)', async () => {
    const response = await request(app)
      .delete('/api/items/0')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid item ID');
  });

  it('should return 400 for invalid item ID (decimal number)', async () => {
    const response = await request(app)
      .delete('/api/items/1.5')
      .expect(400);

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

    const response = await request(app)
      .delete('/api/items/1')
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Failed to delete item');

    // Restore the original database
    db.prepare = originalPrepare;
  });

  it('should delete multiple items sequentially', async () => {
    // Get all items
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    expect(items.length).toBe(3);

    // Delete first item
    await request(app)
      .delete(`/api/items/${items[0].id}`)
      .expect(200);

    // Delete second item
    await request(app)
      .delete(`/api/items/${items[1].id}`)
      .expect(200);

    // Verify only one item remains
    const remainingResponse = await request(app).get('/api/items');
    const remainingItems = remainingResponse.body;
    expect(remainingItems.length).toBe(1);
    expect(remainingItems[0].id).toBe(items[2].id);
  });

  it('should return correct content-type header', async () => {
    const itemsResponse = await request(app).get('/api/items');
    const items = itemsResponse.body;
    const itemToDelete = items[0];

    const response = await request(app)
      .delete(`/api/items/${itemToDelete.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toBeDefined();
  });
});