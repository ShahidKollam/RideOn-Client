import { beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/prisma.js';

beforeAll(async () => {
  // Setup test DB if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});
