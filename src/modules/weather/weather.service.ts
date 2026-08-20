import axios from 'axios';

export interface CityCoordinates {
  cityName: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const INDIAN_MAJOR_CITIES: Record<string, CityCoordinates> = {
  delhi: { cityName: 'New Delhi', state: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090 },
  mumbai: { cityName: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  bengaluru: { cityName: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { cityName: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  ahmedabad: { cityName: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  chennai: { cityName: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  kolkata: { cityName: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  jaipur: { cityName: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  lucknow: { cityName: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  pune: { cityName: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
};

export interface WeatherAQIResult {
  city: string;
  state: string;
  temperatureC: number;
  humidityPercent: number;
  apparentTempC: number;
  windSpeedKmh: number;
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Poor' | 'Unhealthy' | 'Hazardous';
  hydrationAdjustmentMl: number;
  totalRecommendedWaterMl: number;
  workoutRecommendation: {
    mode: 'outdoor_permitted' | 'indoor_forced_low_noise';
    reason: string;
    warningMessage?: string;
  };
  heatAlertLevel: 'Normal' | 'Moderate Heat' | 'Severe Heatwave';
}

export class WeatherService {
  static async getCityWeatherAndAqi(cityNameOrKey: string = 'delhi', baseHydrationMl: number = 2500): Promise<WeatherAQIResult> {
    const key = cityNameOrKey.toLowerCase().trim();
    const city = INDIAN_MAJOR_CITIES[key] || INDIAN_MAJOR_CITIES['delhi'];

    let temperatureC = 31;
    let humidityPercent = 55;
    let apparentTempC = 34;
    let windSpeedKmh = 12;
    let aqi = 145; // Moderate / Poor Indian baseline default

    try {
      // 1. Fetch live weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`;
      const weatherRes = await axios.get(weatherUrl, { timeout: 3500 });

      if (weatherRes.data?.current) {
        temperatureC = Math.round(weatherRes.data.current.temperature_2m);
        humidityPercent = Math.round(weatherRes.data.current.relative_humidity_2m);
        apparentTempC = Math.round(weatherRes.data.current.apparent_temperature);
        windSpeedKmh = Math.round(weatherRes.data.current.wind_speed_10m);
      }

      // 2. Fetch live Air Quality Index (European / US AQI from Open-Meteo Air Quality API)
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.latitude}&longitude=${city.longitude}&current=us_aqi,pm2_5`;
      const aqiRes = await axios.get(aqiUrl, { timeout: 3500 });

      if (aqiRes.data?.current?.us_aqi) {
        aqi = Math.round(aqiRes.data.current.us_aqi);
      }
    } catch (err) {
      console.warn(`Weather API fallback used for ${city.cityName}:`, (err as any).message);
    }

    // 3. Dynamic Hydration Calculation
    // Base + Heat bonus: >30°C -> +400ml, >38°C (Extreme North/West Indian summer) -> +800ml
    let hydrationAdjustmentMl = 0;
    let heatAlertLevel: 'Normal' | 'Moderate Heat' | 'Severe Heatwave' = 'Normal';

    if (temperatureC >= 38) {
      hydrationAdjustmentMl = 800;
      heatAlertLevel = 'Severe Heatwave';
    } else if (temperatureC >= 32) {
      hydrationAdjustmentMl = 400;
      heatAlertLevel = 'Moderate Heat';
    }

    const totalRecommendedWaterMl = Math.min(4500, baseHydrationMl + hydrationAdjustmentMl);

    // 4. AQI & Workout routing logic
    let aqiCategory: WeatherAQIResult['aqiCategory'] = 'Good';
    if (aqi > 300) aqiCategory = 'Hazardous';
    else if (aqi > 200) aqiCategory = 'Unhealthy';
    else if (aqi > 100) aqiCategory = 'Poor';
    else if (aqi > 50) aqiCategory = 'Moderate';

    let workoutRecommendation: WeatherAQIResult['workoutRecommendation'] = {
      mode: 'outdoor_permitted',
      reason: 'Air Quality Index and weather are within safe outdoor training bounds.',
    };

    if (aqi > 200) {
      workoutRecommendation = {
        mode: 'indoor_forced_low_noise',
        reason: `AQI is high (${aqi} - ${aqiCategory}). Outdoor cardio is restricted to prevent pulmonary strain. Switched to apartment-safe low-impact calisthenics & core routine.`,
        warningMessage: '⚠️ Smog / AQI Alert: High PM2.5 levels detected in your city. Keep windows closed and workout indoors.',
      };
    } else if (temperatureC >= 42) {
      workoutRecommendation = {
        mode: 'indoor_forced_low_noise',
        reason: `Extreme heat advisory (${temperatureC}°C). Outdoor training blocked to prevent heat stroke.`,
        warningMessage: '☀️ Heatwave Warning: Peak afternoon workout blocked. Hydrate with electrolyte lemon water.',
      };
    }

    return {
      city: city.cityName,
      state: city.state,
      temperatureC,
      humidityPercent,
      apparentTempC,
      windSpeedKmh,
      aqi,
      aqiCategory,
      hydrationAdjustmentMl,
      totalRecommendedWaterMl,
      workoutRecommendation,
      heatAlertLevel,
    };
  }
}
