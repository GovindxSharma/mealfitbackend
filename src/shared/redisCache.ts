import { Request, Response, NextFunction } from 'express';
import { redisCache } from '../config/redis';

export const REDIS_KEYS = {
  FOOD_ALL: 'master:foods:all',
  FOOD_SEARCH: (query: string) => `master:foods:search:${query.toLowerCase().trim()}`,
  FOOD_CATEGORY: (cat: string) => `master:foods:cat:${cat.toLowerCase().trim()}`,
  NUTRITION_PLAN: (hash: string) => `master:plan:${hash}`,
  KIRANA_LIST: (hash: string) => `master:kirana:${hash}`,
  WEATHER_CITY: (city: string) => `master:weather:${city.toLowerCase().trim()}`,
  WORKOUT_TEMPLATES: 'master:workouts:templates',
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_DAILY_LOG: (userId: string, date: string) => `user:log:${userId}:${date}`,
};

/**
 * Express Middleware to cache API responses in Redis
 * Reduces database reads and serves repeated master queries in <1ms.
 */
export const cacheRoute = (ttlSeconds: number = 1800, keyPrefix: string = 'api') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache safe GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
        return res.status(200).json(cached);
      }
    } catch (err) {
      // Proceed without cache on error
    }

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only cache successful 200/207 responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisCache.set(cacheKey, body, ttlSeconds).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

export { redisCache };
