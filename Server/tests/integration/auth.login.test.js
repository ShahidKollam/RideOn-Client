import request from 'supertest';
import app from '../../src/app.js';
import { describe, it, expect } from 'vitest';

describe('Auth Login', () => {
  it('should send magic link', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
  });
});
