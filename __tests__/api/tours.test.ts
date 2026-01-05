import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/tours/route';
import { NextRequest } from 'next/server';

describe('Tours API', () => {
  it('should return tours list', async () => {
    const req = new NextRequest('http://localhost:3000/api/tours');
    const response = await GET(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const req = new NextRequest('http://localhost:3000/api/tours?id=invalid');
    const response = await GET(req);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
