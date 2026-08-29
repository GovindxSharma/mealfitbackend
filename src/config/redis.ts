import Redis from 'ioredis';
import { config } from './env';

class InMemoryCache {
  private store: Map<string, { value: string; expiresAt: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flushPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;
  private memoryCache: InMemoryCache = new InMemoryCache();
  private isConnected: boolean = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private init() {
    const redisTarget = config.redisUrl || (config.isDev ? 'redis://localhost:6379' : '');

    if (redisTarget) {
      try {
        this.client = new Redis(redisTarget, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2500,
          retryStrategy: (times) => {
            if (times > 3) {
              return null; // Stop retrying and fallback to in-memory cache
            }
            return Math.min(times * 100, 1000);
          },
          lazyConnect: true,
        });

        this.client
          .connect()
          .then(() => {
            this.isConnected = true;
            console.log(`[Redis Cache] Connected successfully to Redis server (${redisTarget.split('@').pop()})`);
          })
          .catch(() => {
            this.isConnected = false;
            console.log('[Redis Cache] Redis server unavailable. Falling back to high-speed in-memory master data cache.');
          });

        this.client.on('error', (_err) => {
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          this.isConnected = true;
        });

        this.client.on('close', () => {
          this.isConnected = false;
        });
      } catch (err) {
        this.isConnected = false;
        console.log('[Redis Cache] Initialized in high-speed in-memory cache mode.');
      }
    } else {
      console.log('[Redis Cache] Operating in high-speed in-memory master cache mode.');
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.client) {
        const raw = await this.client.get(key);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Fallback to memory
    }

    const memRaw = await this.memoryCache.get(key);
    if (memRaw) {
      try {
        return JSON.parse(memRaw);
      } catch {
        return memRaw as unknown as T;
      }
    }
    return null;
  }

  public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      if (this.isConnected && this.client) {
        if (ttlSeconds > 0) {
          await this.client.setex(key, ttlSeconds, serialized);
        } else {
          await this.client.set(key, serialized);
        }
      }
    } catch {
      // Fallback to memory
    }

    await this.memoryCache.set(key, serialized, ttlSeconds);
  }

  public async del(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
    } catch {}

    await this.memoryCache.del(key);
  }

  public async flushPrefix(prefix: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      }
    } catch {}

    await this.memoryCache.flushPrefix(prefix);
  }

  public getStatus() {
    return {
      type: this.isConnected ? 'redis-server' : 'in-memory-lru',
      connected: this.isConnected,
    };
  }
}

export const redisCache = RedisService.getInstance();
