import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { createConfig, createSDK } from './config';

describe('createConfig', () => {
  const testSchema = z.object({
    apiKey: z.string(),
    baseUrl: z.string().optional(),
  });

  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.TEST_API_KEY;
    delete process.env.TEST_BASE_URL;
  });

  it('should use provided config values', () => {
    const config = createConfig({
      schema: testSchema,
      defaults: {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      },
    });

    expect(config).toEqual({
      apiKey: 'test-key',
      baseUrl: 'https://api.example.com',
    });
  });

  it('should use environment variables with prefix', () => {
    process.env.TEST_API_KEY = 'env-key';
    process.env.TEST_BASE_URL = 'https://env.example.com';

    const config = createConfig({
      schema: testSchema,
      envPrefix: 'TEST_',
    });

    expect(config).toEqual({
      apiKey: 'env-key',
      baseUrl: 'https://env.example.com',
    });
  });

  it('should merge defaults with environment variables', () => {
    process.env.TEST_API_KEY = 'env-key';

    const config = createConfig({
      schema: testSchema,
      envPrefix: 'TEST_',
      defaults: {
        baseUrl: 'https://default.example.com',
      },
    });

    expect(config).toEqual({
      apiKey: 'env-key',
      baseUrl: 'https://default.example.com',
    });
  });
});

describe('createSDK', () => {
  const testSchema = z.object({
    apiKey: z.string(),
  });

  interface TestService {
    getApiKey(): string;
  }

  function createTestService(config: { apiKey: string }): TestService {
    return {
      getApiKey: () => config.apiKey,
    };
  }

  it('should create service with provided config', () => {
    const createTestSDK = createSDK({
      configSchema: testSchema,
      createService: createTestService,
    });

    const service = createTestSDK({ apiKey: 'test-key' });
    expect(service.getApiKey()).toBe('test-key');
  });

  it('should create service with environment variables', () => {
    process.env.TEST_API_KEY = 'env-key';

    const createTestSDK = createSDK({
      configSchema: testSchema,
      createService: createTestService,
      envPrefix: 'TEST_',
    });

    const service = createTestSDK();
    expect(service.getApiKey()).toBe('env-key');
  });

  it('should merge provided config with environment variables', () => {
    process.env.TEST_API_KEY = 'env-key';

    const createTestSDK = createSDK({
      configSchema: testSchema,
      createService: createTestService,
      envPrefix: 'TEST_',
    });

    const service = createTestSDK({ apiKey: 'override-key' });
    expect(service.getApiKey()).toBe('override-key');
  });
});
