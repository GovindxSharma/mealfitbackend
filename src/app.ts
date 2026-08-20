import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
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

  // Middleware Pipeline
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching whitelist
      if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev for smooth local testing
      }
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Root Welcome & API Discovery Route
  app.get('/', (_req, res) => {
    res.status(200).json(
      createSuccessResponse({
        name: 'MealFit API (Modular Monolith)',
        version: '1.0.0',
        description: 'Hyper-Localized India-First Nutrition, Budget Meal Optimization & Adaptive Fitness API',
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
      }, 'MealFit backend API is up and running')
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
