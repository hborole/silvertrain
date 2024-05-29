import request from 'supertest';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  await connectDB();
});

describe('/suggestions endpoint', () => {
  test('should require query parameter q', async () => {
    const response = await request(app).get('/suggestions');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Query parameter q is required');
  });

  test('should return suggestions based on query', async () => {
    const response = await request(app).get('/suggestions?q=Abe');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('suggestions');
    expect(response.body.suggestions).toBeInstanceOf(Array);
  });

  test('should handle optional lat and long parameters', async () => {
    const response = await request(app).get(
      '/suggestions?q=Abe&lat=40.7128&long=-74.0060'
    );
    expect(response.status).toBe(200);
    expect(response.body.suggestions[0]).toHaveProperty('fullName');
    expect(response.body.suggestions[0]).toHaveProperty('coordinates');
  });

  test('should sort suggestions by proximity if lat and long are provided', async () => {
    const response = await request(app).get(
      '/suggestions?q=Abe&lat=40.7128&long=-74.0060'
    );
    expect(response.status).toBe(200);
  });
});

afterAll(() => {
  mongoose.disconnect();
});
