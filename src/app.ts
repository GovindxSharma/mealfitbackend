import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './shared/errorHandler';
import { createSuccessResponse } from './shared/types';

// Module Route Imports
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { goalRoutes } from './modules/goals/goals.routes';
import { nutritionRoutes } from './modules/nutrition/nutrition.routes';
import { weatherRoutes } from './modules/weather/weather.routes';
import { workoutRoutes } from './modules/workouts/workouts.routes';
import { dailyLogRoutes } from './modules/daily-logs/dailyLog.routes';

export const createApp = (): express.Application => {
  const app = express();

  // Trust reverse proxy for accurate IP resolution behind Render / Cloudflare / AWS ALBs
  app.set('trust proxy', 1);

  // 1. High-Performance Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    })
  );

  // 2. High-Speed Gzip/Deflate Payload Compression
  app.use(compression());

  // 3. CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    })
  );

  // 4. Rate Limiting for Scalability & DDoS Protection
  const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 600, // Max 600 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests. Please slow down and try again later.',
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 120, // Max 120 auth requests per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many authentication attempts. Please try again after a few minutes.',
    },
  });

  app.use('/api', generalApiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // 5. Body Parsing with Safety Limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 6. Request Logging
  if (config.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Root Welcome & API Discovery Route
  app.get('/', (_req, res) => {
    res.status(200).json(
      createSuccessResponse(
        {
          name: 'MealFit API (Modular Monolith - Production Scale)',
          version: '1.0.0',
          description: 'Hyper-Localized India-First Nutrition, Budget Meal Optimization & Adaptive Fitness API',
          scaleFeatures: {
            redisCaching: 'Active (Sub-1ms Latency)',
            rateLimiting: 'Enabled',
            compression: 'Enabled (Gzip/Brotli)',
            securityHeaders: 'Helmet Protected',
            clusteringReady: 'Yes',
          },
          endpoints: {
            healthCheck: '/api/health',
            healthDetails: '/api/health/details',
            auth: '/api/auth',
            goals: '/api/goals',
            nutrition: '/api/nutrition',
            weather: '/api/weather',
            workouts: '/api/workouts',
            logs: '/api/logs',
          },
        },
        'MealFit backend API is live and scalable'
      )
    );
  });

  // Mount Modular Monolith Domain Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/nutrition', nutritionRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/logs', dailyLogRoutes);

  // 404 Route Catch-all
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: [${req.method}] ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
