const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    let createdItemId;

    beforeEach(async () => {
      // Create a test item for deletion tests
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Item to Delete' })
        .set('Accept', 'application/json');
      
      createdItemId = response.body.id;
    });

    it('should delete an existing item', async () => {
      const response = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
      expect(response.body).toHaveProperty('deletedItem');
      expect(response.body.deletedItem.id).toBe(createdItemId);
      expect(response.body.deletedItem.name).toBe('Item to Delete');
    });

    it('should verify item is actually deleted from database', async () => {
      // First delete the item
      await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set('Accept', 'application/json');
      
      // Then try to get all items and verify it's not there
      const getResponse = await request(app).get('/api/items');
      const deletedItem = getResponse.body.find(item => item.id === createdItemId);
      
      expect(deletedItem).toBeUndefined();
    });

    it('should return 404 for non-existent item', async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .delete(`/api/items/${nonExistentId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid item ID', async () => {
      const invalidId = 'not-a-number';
      const response = await request(app)
        .delete(`/api/items/${invalidId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid item ID');
    });

    it('should return 400 for negative item ID', async () => {
      const negativeId = -1;
      const response = await request(app)
        .delete(`/api/items/${negativeId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid item ID');
    });

    it('should return 400 for zero item ID', async () => {
      const zeroId = 0;
      const response = await request(app)
        .delete(`/api/items/${zeroId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid item ID');
    });

    it('should handle multiple deletions correctly', async () => {
      // Create another item
      const secondResponse = await request(app)
        .post('/api/items')
        .send({ name: 'Second Item to Delete' })
        .set('Accept', 'application/json');
      
      const secondItemId = secondResponse.body.id;

      // Delete first item
      const firstDeleteResponse = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set('Accept', 'application/json');
      
      expect(firstDeleteResponse.status).toBe(200);

      // Delete second item
      const secondDeleteResponse = await request(app)
        .delete(`/api/items/${secondItemId}`)
        .set('Accept', 'application/json');
      
      expect(secondDeleteResponse.status).toBe(200);

      // Verify both items are deleted
      const getResponse = await request(app).get('/api/items');
      const remainingItems = getResponse.body.filter(item => 
        item.id === createdItemId || item.id === secondItemId
      );
      
      expect(remainingItems).toHaveLength(0);
    });
  });
});