import { z } from 'zod';

export type ConfigSchema<T> = z.ZodType<T>;

export interface ConfigOptions<T> {
  schema: ConfigSchema<T>;
  envPrefix?: string;
  defaults?: Partial<T>;
}

export function createConfig<T>({
  schema,
  envPrefix = '',
  defaults = {},
}: ConfigOptions<T>): T {
  const envConfig: Record<string, string> = {};

  // Collect all environment variables with the given prefix
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(envPrefix)) {
      const configKey = key.slice(envPrefix.length).toLowerCase();
      envConfig[configKey] = process.env[key] || '';
    }
  });

  // Merge defaults with environment variables
  const config = {
    ...defaults,
    ...envConfig,
  };

  // Validate and return the config
  return schema.parse(config);
}

export function createSDK<T, S>({
  configSchema,
  createService,
  envPrefix = '',
  defaults = {},
}: {
  configSchema: ConfigSchema<T>;
  createService: (config: T) => S;
  envPrefix?: string;
  defaults?: Partial<T>;
}) {
  return (config?: Partial<T>): S => {
    const finalConfig = createConfig({
      schema: configSchema,
      envPrefix,
      defaults: {
        ...defaults,
        ...config,
      },
    });

    return createService(finalConfig);
  };
}
