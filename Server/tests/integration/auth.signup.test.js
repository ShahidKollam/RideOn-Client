import request from 'supertest';
import app from '../../src/app.js';
import { describe, it, expect } from 'vitest';

describe('Auth Signup', () => {
  it('should signup a user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        campusId: 'some-id', // Adjust after seed
      });
    expect(res.status).toBe(201);
  });
});
