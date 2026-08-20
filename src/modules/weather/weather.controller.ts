import { Request, Response } from 'express';
import { WeatherService, INDIAN_MAJOR_CITIES } from './weather.service';
import { asyncHandler } from '../../shared/errorHandler';
import { createSuccessResponse } from '../../shared/types';

export class WeatherController {
  // Get live weather and AQI for a specific Indian city
  static getCityStatus = asyncHandler(async (req: Request, res: Response) => {
    const city = (req.query.city as string) || 'delhi';
    const baseHydrationMl = Number(req.query.baseHydrationMl) || 2500;

    const result = await WeatherService.getCityWeatherAndAqi(city, baseHydrationMl);
    return res.status(200).json(createSuccessResponse(result, `Live weather & AQI for ${result.city}`));
  });

  // Get list of supported major Indian cities
  static getSupportedCities = asyncHandler(async (_req: Request, res: Response) => {
    const cities = Object.entries(INDIAN_MAJOR_CITIES).map(([key, data]) => ({
      key,
      name: data.cityName,
      state: data.state,
    }));
    return res.status(200).json(createSuccessResponse(cities, 'Supported cities retrieved'));
  });
}
