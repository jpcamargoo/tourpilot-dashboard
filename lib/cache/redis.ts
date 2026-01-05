import { createClient } from 'redis';

// Singleton Redis client
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Redis connection failed after 10 retries');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
  }

  return redisClient;
}

// Cache utilities
export class CacheService {
  private static TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
  };

  static async get<T>(key: string): Promise<T | null> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
        return null; // Skip cache in dev without Redis
      }

      const client = await getRedisClient();
      const data = await client.get(key);
      
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = this.TTL.MEDIUM): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
        return; // Skip cache in dev without Redis
      }

      const client = await getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
        return;
      }

      const client = await getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
        return;
      }

      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Cache invalidation helpers
  static invalidateTours() {
    return this.deletePattern('tours:*');
  }

  static invalidateGuias() {
    return this.deletePattern('guias:*');
  }

  static invalidateSessoes() {
    return this.deletePattern('sessoes:*');
  }

  static invalidateDashboard() {
    return this.deletePattern('dashboard:*');
  }
}

// Cache key generators
export const CacheKeys = {
  tours: {
    list: () => 'tours:list',
    detail: (id: string) => `tours:detail:${id}`,
    stats: () => 'tours:stats',
  },
  guias: {
    list: () => 'guias:list',
    detail: (id: string) => `guias:detail:${id}`,
    stats: () => 'guias:stats',
  },
  sessoes: {
    list: () => 'sessoes:list',
    today: () => 'sessoes:today',
    upcoming: () => 'sessoes:upcoming',
  },
  dashboard: {
    metrics: () => 'dashboard:metrics',
    charts: () => 'dashboard:charts',
  },
  reviews: {
    stats: () => 'reviews:stats',
    recent: () => 'reviews:recent',
  },
};
