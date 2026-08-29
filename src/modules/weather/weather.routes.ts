import { Router } from 'express';
import { WeatherController } from './weather.controller';
import { cacheRoute } from '../../shared/redisCache';

const router = Router();

router.get('/cities', cacheRoute(3600, 'master:weather'), WeatherController.getSupportedCities);
router.get('/status', cacheRoute(900, 'master:weather'), WeatherController.getCityStatus);

export const weatherRoutes = router;
