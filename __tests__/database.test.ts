import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';

describe('Database Connection', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
  });

  it('should count users', async () => {
    const count = await prisma.usuario.count();
    expect(typeof count).toBe('number');
  });

  it('should count tours', async () => {
    const count = await prisma.tour.count();
    expect(typeof count).toBe('number');
  });
});
