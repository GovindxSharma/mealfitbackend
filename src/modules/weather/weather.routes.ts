import { Router } from 'express';
import { WeatherController } from './weather.controller';

const router = Router();

router.get('/cities', WeatherController.getSupportedCities);
router.get('/status', WeatherController.getCityStatus);

export const weatherRoutes = router;
