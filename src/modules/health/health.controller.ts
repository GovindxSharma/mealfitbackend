import { Request, Response } from 'express';
import os from 'os';
import axios from 'axios';
import { checkDbHealth } from '../../config/db';
import { config } from '../../config/env';
import { redisCache } from '../../config/redis';
import { createSuccessResponse } from '../../shared/types';
import { asyncHandler } from '../../shared/errorHandler';

const startTime = new Date();

export class HealthController {
  // Fast Liveness Probe
  static getLiveness = (_req: Request, res: Response) => {
    const uptimeSeconds = process.uptime();
    return res.status(200).json(
      createSuccessResponse({
        status: 'UP',
        app: 'MealFit API',
        uptimeSeconds: Math.floor(uptimeSeconds),
        uptimeHuman: formatUptime(uptimeSeconds),
        timestamp: new Date().toISOString(),
      }, 'Service is live')
    );
  };

  // Deep Readiness & Life Status Probe
  static getDetailedStatus = asyncHandler(async (_req: Request, res: Response) => {
    const uptimeSeconds = process.uptime();
    const memUsage = process.memoryUsage();

    // 1. Database Health Check
    const dbHealth = await checkDbHealth();

    // 2. Weather External Service Check (Open-Meteo)
    let weatherServiceStatus = { status: 'unknown', latencyMs: null as number | null };
    try {
      const weatherStart = Date.now();
      const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true', {
        timeout: 3000,
      });
      weatherServiceStatus = {
        status: weatherRes.status === 200 ? 'healthy' : 'degraded',
        latencyMs: Date.now() - weatherStart,
      };
    } catch (err: any) {
      weatherServiceStatus = {
        status: 'unreachable',
        latencyMs: null,
      };
    }

    // 3. System Metrics
    const systemMetrics = {
      platform: os.platform(),
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
      processMemory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      },
    };

    // Overall Service Health
    const isOverallHealthy = dbHealth.isConnected;
    const statusCode = isOverallHealthy ? 200 : 207; // 207 Multi-Status if DB is degraded

    return res.status(statusCode).json(
      createSuccessResponse({
        overallStatus: isOverallHealthy ? 'HEALTHY' : 'DEGRADED',
        service: 'MealFit Backend API',
        environment: config.nodeEnv,
        startTime: startTime.toISOString(),
        uptimeSeconds: Math.floor(uptimeSeconds),
        uptimeHuman: formatUptime(uptimeSeconds),
        database: dbHealth,
        cache: redisCache.getStatus(),
        externalServices: {
          openMeteoWeather: weatherServiceStatus,
        },
        modules: [
          { name: 'Health & Diagnostics', status: 'active', path: '/api/health' },
          { name: 'Auth & Profile', status: 'active', path: '/api/auth' },
          { name: 'Goals & Biometrics', status: 'active', path: '/api/goals' },
          { name: 'Indian Nutrition & Kirana', status: 'active', path: '/api/nutrition' },
          { name: 'Weather & AQI Engine', status: 'active', path: '/api/weather' },
          { name: 'Adaptive Workouts', status: 'active', path: '/api/workouts' },
          { name: 'Daily Aggregate Logs', status: 'active', path: '/api/logs' },
        ],
        system: systemMetrics,
      }, isOverallHealthy ? 'All systems operational' : 'Partial service degradation (check DB connection)')
    );
  });
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}
