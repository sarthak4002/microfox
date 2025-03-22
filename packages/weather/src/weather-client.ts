import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import { z } from 'zod';

export namespace weatherapi {
  export const BASE_URL = 'https://api.weatherapi.com/v1';

  export const WeatherConditionSchema = z.object({
    code: z.number().describe('Weather condition code'),
    icon: z.string().describe('URL to weather icon'),
    text: z.string().describe('Weather condition text'),
  });
  export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;

  export const CurrentWeatherSchema = z.object({
    cloud: z.number().describe('Cloud cover as percentage'),
    condition: WeatherConditionSchema.describe('Weather condition details'),
    feelslike_c: z.number().describe('Feels like temperature in celsius'),
    feelslike_f: z.number().describe('Feels like temperature in fahrenheit'),
    gust_kph: z.number().describe('Wind gust in kilometer per hour'),
    gust_mph: z.number().describe('Wind gust in miles per hour'),
    humidity: z.number().describe('Humidity as percentage'),
    is_day: z.number().describe('Whether it is daytime (1) or not (0)'),
    last_updated: z.string().describe('Last updated time as string'),
    last_updated_epoch: z.number().describe('Last updated time as epoch'),
    precip_in: z.number().describe('Precipitation in inches'),
    precip_mm: z.number().describe('Precipitation in millimeters'),
    pressure_in: z.number().describe('Pressure in inches'),
    pressure_mb: z.number().describe('Pressure in millibars'),
    temp_c: z.number().describe('Temperature in celsius'),
    temp_f: z.number().describe('Temperature in fahrenheit'),
    uv: z.number().describe('UV Index'),
    vis_km: z.number().describe('Visibility in kilometers'),
    vis_miles: z.number().describe('Visibility in miles'),
    wind_degree: z.number().describe('Wind direction in degrees'),
    wind_dir: z.string().describe('Wind direction as 16 point compass'),
    wind_kph: z.number().describe('Wind speed in kilometer per hour'),
    wind_mph: z.number().describe('Wind speed in miles per hour'),
  });
  export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;

  export const WeatherLocationSchema = z.object({
    country: z.string().describe('Country name'),
    lat: z.number().describe('Latitude'),
    localtime: z.string().describe('Local time as string'),
    localtime_epoch: z.number().describe('Local time as epoch'),
    lon: z.number().describe('Longitude'),
    name: z.string().describe('Location name'),
    region: z.string().describe('Region or state of the location'),
    tz_id: z.string().describe('Timezone identifier'),
  });
  export type WeatherLocation = z.infer<typeof WeatherLocationSchema>;

  export const CurrentWeatherResponseSchema = z.object({
    current: CurrentWeatherSchema.describe('Current weather data'),
    location: WeatherLocationSchema.describe('Location data'),
  });
  export type CurrentWeatherResponse = z.infer<
    typeof CurrentWeatherResponseSchema
  >;

  export const WeatherIPInfoResponseSchema = z.object({
    ip: z.string().describe('IP address'),
    type: z.string().describe('IP type'),
    continent_code: z.string().describe('Continent code'),
    continent_name: z.string().describe('Continent name'),
    country_code: z.string().describe('Country code'),
    country_name: z.string().describe('Country name'),
    is_eu: z.string().describe('Whether location is in EU or not'),
    geoname_id: z.number().describe('Geoname ID'),
    city: z.string().describe('City name'),
    region: z.string().describe('Region name'),
    lat: z.number().describe('Latitude'),
    lon: z.number().describe('Longitude'),
    tz_id: z.string().describe('Timezone identifier'),
    localtime_epoch: z.number().describe('Local time as epoch'),
    localtime: z.string().describe('Local time as string'),
  });
  export type WeatherIPInfoResponse = z.infer<
    typeof WeatherIPInfoResponseSchema
  >;
}

/**
 * Simple Weather API client for accessing weather data based on location.
 *
 * @see https://www.weatherapi.com
 */
export class WeatherClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiKey: string;
  protected readonly apiBaseUrl: string;

  constructor({
    apiKey = getEnv('WEATHER_API_KEY'),
    apiBaseUrl = weatherapi.BASE_URL,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiKey,
      'WeatherClient missing required "apiKey" (defaults to "WEATHER_API_KEY")',
    );
    super();

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;

    this.ky = ky.extend({ prefixUrl: apiBaseUrl });
  }

  /**
   * Gets info about the current weather at a given location.
   */
  @aiFunction({
    name: 'get_current_weather',
    description: 'Gets info about the current weather at a given location.',
    inputSchema: z.object({
      q: z
        .string()
        .describe(
          'Location to get the weather for. Can be a city name, zipcode, IP address, or lat/lng coordinates. Example: "London"',
        ),
    }),
  })
  async getCurrentWeather(queryOrOptions: string | { q: string }) {
    const options =
      typeof queryOrOptions === 'string'
        ? { q: queryOrOptions }
        : queryOrOptions;

    return this.ky
      .get('current.json', {
        searchParams: sanitizeSearchParams({
          key: this.apiKey,
          ...options,
        }),
      })
      .json<weatherapi.CurrentWeatherResponse>();
  }
}
