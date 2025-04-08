import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateText, generateObject, tool } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';

const execAsync = promisify(exec);

// Schema for SDK generation arguments
const GenerateSDKArgsSchema = z.object({
  query: z.string().describe('Query describing the API (e.g., "Github API")'),
});

type GenerateSDKArgs = z.infer<typeof GenerateSDKArgsSchema>;

// Schema for SDK metadata
const SDKMetadataSchema = z.object({
  apiName: z.string().describe('A proper API name (e.g. "GitHub")'),
  packageName: z
    .string()
    .describe('Package name (@microfox/name in lowercase, kebab-case)'),
  title: z.string().describe('Microfox Name SDK title'),
  description: z.string().describe('A clear description of what this SDK does'),
  keywords: z.array(z.string()).describe('Relevant keywords for the package'),
  authType: z
    .enum(['oauth2', 'apiKey', 'auto'])
    .describe(
      'Authentication type for this SDK: "oauth2" for OAuth 2.0 flow, "apiKey" for API key authentication, or "auto" to let the model decide',
    ),
});

type SDKMetadata = z.infer<typeof SDKMetadataSchema>;

/**
 * Ensure required keywords are included
 */
function ensureRequiredKeywords(keywords: string[]): string[] {
  const required = ['microfox', 'sdk', 'typescript'];
  const lowercaseKeywords = keywords.map(k => k.toLowerCase());

  const missingKeywords = required.filter(k => !lowercaseKeywords.includes(k));
  return [...keywords, ...missingKeywords];
}

/**
 * Generate SDK metadata from query using Gemini Flash
 */
async function generateMetadata(query: string): Promise<SDKMetadata> {
  console.log('🧠 Generating SDK metadata from query...');

  const { object: metadata } = await generateObject({
    model: models.googleGeminiFlash,
    schema: SDKMetadataSchema,
    prompt: dedent`
      Generate metadata for a TypeScript SDK based on this query: "${query}"
      
      The package name should be lowercase, use kebab-case, and have the prefix "@microfox/".
      Make the description clear and concise.
      Include relevant keywords (3-4 total).
      
      For authType:
      - Use "oauth2" if the API primarily uses OAuth 2.0 for authentication (like Google, GitHub, or LinkedIn APIs)
      - Use "apiKey" if the API primarily uses API keys or tokens for authentication
      - Use "auto" if you're not sure about the authentication mechanism
    `,
    temperature: 0.2,
  });

  // Ensure required keywords are present
  metadata.keywords = ensureRequiredKeywords(metadata.keywords);

  console.log('✅ Generated metadata successfully');
  return metadata;
}

/**
 * Scrape content from URLs using fetch
 */
async function scrapeUrls(urls: string[]): Promise<string[]> {
  const contents: string[] = [];

  for (const url of urls) {
    try {
      console.log(`🔍 Scraping ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9', // Prioritize English language content
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          Country: 'US', // Specify country to ensure content is from English-speaking regions
        },
      });
      const html = await response.text();

      // Use a simple regex-based approach to extract text and remove tags
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '') // Remove SVGs
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      contents.push(`URL: ${url}\n\nContent:\n${textContent.slice(0, 5000)}`);
    } catch (error) {
      console.warn(`⚠️ Error scraping ${url}:`, error);
    }
  }

  return contents;
}

/**
 * Create package.json file
 */
function createInitialPackageJson(
  packageName: string,
  description: string,
  title: string,
  keywords: string[],
): any {
  return {
    name: packageName,
    version: '0.0.1',
    description,
    main: './dist/index.js',
    module: './dist/index.mjs',
    types: './dist/index.d.ts',
    files: ['dist/**/*', 'CHANGELOG.md'],
    scripts: {
      build: 'tsup',
      'build:watch': 'tsup --watch',
      clean: 'rm -rf dist',
      lint: 'eslint "./**/*.ts*"',
      'prettier-check': 'prettier --check "./**/*.ts*"',
    },
    exports: {
      './package.json': './package.json',
      '.': {
        import: './dist/index.mjs',
        require: './dist/index.js',
      },
    },
    dependencies: {
      zod: '^3.24.2',
    },
    devDependencies: {
      '@microfox/tsconfig': '*',
      '@types/node': '^18',
      tsup: '^8',
      typescript: '5.6.3',
    },
    publishConfig: {
      access: 'public',
    },
    engines: {
      node: '>=20.0.0',
    },
    homepage: 'https://github.com/microfox-ai/microfox',
    repository: {
      type: 'git',
      url: 'git+https://github.com/microfox-ai/microfox.git',
    },
    bugs: {
      url: 'https://github.com/microfox-ai/microfox/issues',
    },
    keywords,
  };
}

/**
 * Create package-info.json file
 */
function createInitialPackageInfo(
  packageName: string,
  title: string,
  description: string,
  constructorName: string = '',
  requiredApiKeys: {
    key: string;
    displayName: string;
    description: string;
  }[] = [],
  authType: string = 'apiKey',
  functions: string[] = [],
): any {
  return {
    name: packageName,
    title,
    description,
    path: `packages/${packageName.replace('@microfox/', '')}`,
    dependencies: ['zod'],
    status: 'stable',
    authEndpoint: `/connect/${packageName.replace('@microfox/', '')}`,
    documentation: `https://www.npmjs.com/package/${packageName}`,
    icon: `https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/${packageName.replace('@microfox/', '').replace('-', '-').replace('_', '-')}.svg`,
    readme_map: {
      path: '/README.md',
      title: `${constructorName || title} Microfox`,
      functionalities: functions.length > 0 ? functions : [],
      description: `The full README for the ${title}`,
    },
    constructors: constructorName
      ? [
          {
            name: constructorName || ``,
            description: `Create a new ${title} client through which you can interact with the API`,
            auth: authType,
            requiredKeys: requiredApiKeys.length > 0 ? requiredApiKeys : [],
            internalKeys: [],
            functionalities: functions.length > 0 ? functions : [],
          },
        ]
      : [],
    keysInfo:
      requiredApiKeys?.length > 0
        ? requiredApiKeys.map(key => ({
            key: key.key,
            constructors: [
              constructorName ||
                `create${packageName
                  .replace('@microfox/', '')
                  .split('-')
                  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                  .join('')}SDK`,
            ],
            description: key.description,
            required: true,
          }))
        : [],
    extraInfo: [
      constructorName
        ? `Use the \`${constructorName}\` constructor to create a new client.`
        : null,
    ],
  };
}

/**
 * Create fixed files with predefined content
 */
async function createFixedFiles(destDir: string): Promise<void> {
  // File contents as strings
  const tsConfigContent = `{
  "extends": "@microfox/tsconfig/ts-library.json",
  "include": ["."],
  "exclude": ["*/dist", "dist", "build", "node_modules"]
}`;

  const tsupConfigContent = `import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
  },
]);`;

  const turboJsonContent = `{
  "extends": [
    "//"
  ],
  "tasks": {
    "build": {
      "outputs": [
        "**/dist/**"
      ]
    }
  }
}`;

  // Create files with content
  const filesToCreate: Record<string, string> = {
    'tsconfig.json': tsConfigContent,
    'tsup.config.ts': tsupConfigContent,
    'turbo.json': turboJsonContent,
  };

  for (const [file, content] of Object.entries(filesToCreate)) {
    const destPath = path.join(destDir, file);
    fs.writeFileSync(destPath, content);
    console.log(`✅ Created ${file}`);
  }
}

/**
 * Get OAuth template code based on API provider
 */
function getOAuthTemplateCode(apiName: string): string | null {
  // Normalize API name to lowercase for comparison
  const normalizedApiName = apiName.toLowerCase();

  // Google OAuth template
  if (normalizedApiName.includes('google')) {
    return dedent`
      // Constants for Google OAuth endpoints
      const TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
      const TOKEN_REFRESH_URL = 'https://oauth2.googleapis.com/token';
      const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
      const TOKEN_URL = 'https://oauth2.googleapis.com/token';
      
      // Basic schemas for token handling
      export const TokenResponseSchema = z.object({
        access_token: z.string().describe('The access token issued by the authorization server'),
        expires_in: z.number().describe('The lifetime of the access token in seconds'),
        token_type: z.string().optional().describe('The type of the token, typically "Bearer"'),
        scope: z.string().optional().describe('The scopes that the access token is valid for'),
        refresh_token: z.string().optional().describe('The refresh token used to obtain new access tokens'),
      });
      
      export type TokenResponse = z.infer<typeof TokenResponseSchema>;
      
      // Base options for SDK constructor
      export const GoogleSDKOptionsSchema = z.object({
        clientId: z.string().describe('Google API client ID for the application'),
        clientSecret: z.string().describe('Google API client secret for the application'),
        redirectUri: z.string().describe('URI to redirect after authentication'),
        scopes: z.array(z.string()).describe('List of OAuth scopes to request'),
        accessToken: z.string().optional().describe('Existing access token if available'),
        refreshToken: z.string().optional().describe('Existing refresh token if available'),
        accessType: z.enum(['online', 'offline']).optional().describe('Whether to issue a refresh token'),
        prompt: z.enum(['none', 'consent', 'select_account']).optional().describe('Type of authentication prompt to display')
      });
      
      export type GoogleSDKOptions = z.infer<typeof GoogleSDKOptionsSchema>;
      
      /**
       * Check if an access token is valid
       */
      async function checkGoogleTokenValidity(accessToken: string): Promise<boolean> {
        if (!accessToken) return false;
        
        try {
          const response = await fetch(\`\${TOKEN_INFO_URL}?access_token=\${accessToken}\`);
          return response.ok;
        } catch (error) {
          console.error('Error checking token validity:', error);
          return false;
        }
      }
      
      /**
       * Refresh an access token using a refresh token
       */
      async function refreshGoogleAccessToken(
        refreshToken: string,
        clientId: string,
        clientSecret: string
      ): Promise<TokenResponse | null> {
        if (!refreshToken) return null;
        
        try {
          const params = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          });
          
          const response = await fetch(TOKEN_REFRESH_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          
          if (!response.ok) return null;
          
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return null;
        }
      }
      
      /**
       * Exchange an authorization code for access and refresh tokens
       */
      export async function exchangeCodeForGoogleTokens(
        code: string,
        clientId: string,
        clientSecret: string,
        redirectUri: string
      ): Promise<TokenResponse | null> {
        try {
          const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          });
      
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
      
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error_description || 'Failed to exchange code for tokens');
          }
      
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error exchanging code for tokens:', error);
          return null;
        }
      }
    `;
  }

  // LinkedIn OAuth template
  else if (normalizedApiName.includes('linkedin')) {
    return dedent`
      // Constants for LinkedIn OAuth endpoints
      const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
      const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
      const TOKEN_INFO_URL = 'https://api.linkedin.com/v2/me'; // Used to verify token validity
      
      // Basic schemas for token handling
      export const TokenResponseSchema = z.object({
        access_token: z.string().describe('The access token issued by LinkedIn'),
        expires_in: z.number().describe('The lifetime of the access token in seconds'),
        refresh_token: z.string().optional().describe('The refresh token used to obtain new access tokens')
      });
      
      export type TokenResponse = z.infer<typeof TokenResponseSchema>;
      
      // Base options for SDK constructor
      export const LinkedInSDKOptionsSchema = z.object({
        clientId: z.string().describe('LinkedIn API client ID for the application'),
        clientSecret: z.string().describe('LinkedIn API client secret for the application'),
        redirectUri: z.string().describe('URI to redirect after authentication'),
        scopes: z.array(z.string()).describe('List of OAuth scopes to request'),
        accessToken: z.string().optional().describe('Existing access token if available'),
        refreshToken: z.string().optional().describe('Existing refresh token if available')
      });
      
      export type LinkedInSDKOptions = z.infer<typeof LinkedInSDKOptionsSchema>;
      
      /**
       * Check if an access token is valid
       */
      async function checkLinkedInTokenValidity(accessToken: string): Promise<boolean> {
        if (!accessToken) return false;
        
        try {
          const response = await fetch(TOKEN_INFO_URL, {
            headers: {
              Authorization: \`Bearer \${accessToken}\`
            }
          });
          return response.ok;
        } catch (error) {
          console.error('Error checking token validity:', error);
          return false;
        }
      }
      
      /**
       * Refresh an access token using a refresh token
       */
      async function refreshLinkedInAccessToken(
        refreshToken: string,
        clientId: string,
        clientSecret: string
      ): Promise<TokenResponse | null> {
        if (!refreshToken) return null;
        
        try {
          const params = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          });
          
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          
          if (!response.ok) return null;
          
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return null;
        }
      }
      
      /**
       * Exchange an authorization code for access and refresh tokens
       */
      export async function exchangeCodeForLinkedInTokens(
        code: string,
        clientId: string,
        clientSecret: string,
        redirectUri: string
      ): Promise<TokenResponse | null> {
        try {
          const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          });
      
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
      
          if (!response.ok) return null;
      
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error exchanging code for tokens:', error);
          return null;
        }
      }
    `;
  }

  // GitHub OAuth template
  else if (normalizedApiName.includes('github')) {
    return dedent`
      // Constants for GitHub OAuth endpoints
      const AUTH_URL = 'https://github.com/login/oauth/authorize';
      const TOKEN_URL = 'https://github.com/login/oauth/access_token';
      const TOKEN_INFO_URL = 'https://api.github.com/user'; // Used to verify token validity
      
      // Basic schemas for token handling
      export const TokenResponseSchema = z.object({
        access_token: z.string().describe('The access token issued by GitHub'),
        token_type: z.string().describe('The type of token, typically "bearer"'),
        scope: z.string().describe('The scopes that were granted for the token'),
        refresh_token: z.string().optional().describe('The refresh token used to obtain new access tokens'),
        expires_in: z.number().optional().describe('The lifetime of the access token in seconds')
      });
      
      export type TokenResponse = z.infer<typeof TokenResponseSchema>;
      
      // Base options for SDK constructor
      export const GitHubSDKOptionsSchema = z.object({
        clientId: z.string().describe('GitHub OAuth App client ID'),
        clientSecret: z.string().describe('GitHub OAuth App client secret'),
        redirectUri: z.string().describe('URI to redirect after authentication'),
        scopes: z.array(z.string()).describe('List of OAuth scopes to request'),
        accessToken: z.string().optional().describe('Existing access token if available'),
        allowSignup: z.boolean().optional().describe('Whether to allow users to sign up for GitHub during OAuth flow')
      });
      
      export type GitHubSDKOptions = z.infer<typeof GitHubSDKOptionsSchema>;
      
      /**
       * Check if an access token is valid
       */
      async function checkGitHubTokenValidity(accessToken: string): Promise<boolean> {
        if (!accessToken) return false;
        
        try {
          const response = await fetch(TOKEN_INFO_URL, {
            headers: {
              Authorization: \`Bearer \${accessToken}\`
            }
          });
          return response.ok;
        } catch (error) {
          console.error('Error checking token validity:', error);
          return false;
        }
      }
      
      /**
       * Exchange an authorization code for access and refresh tokens
       */
      export async function exchangeCodeForGitHubToken(
        code: string,
        clientId: string,
        clientSecret: string,
        redirectUri?: string
      ): Promise<TokenResponse | null> {
        try {
          const params: Record<string, string> = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
          };
          
          if (redirectUri) {
            params.redirect_uri = redirectUri;
          }
      
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(params),
          });
      
          if (!response.ok) return null;
      
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error exchanging code for token:', error);
          return null;
        }
      }
    `;
  }

  // Generic OAuth template for other services
  else {
    return dedent`
      // Generic OAuth 2.0 endpoints (update these with the specific endpoints for your API)
      const AUTH_URL = 'https://example.com/oauth/authorize';
      const TOKEN_URL = 'https://example.com/oauth/token';
      const TOKEN_INFO_URL = 'https://example.com/oauth/tokeninfo'; // Used to verify token validity
      
      // Basic schemas for token handling
      export const TokenResponseSchema = z.object({
        access_token: z.string().describe('The access token issued by the authorization server'),
        expires_in: z.number().optional().describe('The lifetime of the access token in seconds'),
        token_type: z.string().optional().describe('The type of the token, typically "Bearer"'),
        scope: z.string().optional().describe('The scopes that the access token is valid for'),
        refresh_token: z.string().optional().describe('The refresh token used to obtain new access tokens')
      });
      
      export type TokenResponse = z.infer<typeof TokenResponseSchema>;
      
      // Base options for SDK constructor
      export const SDKOptionsSchema = z.object({
        clientId: z.string().describe('OAuth client ID for the application'),
        clientSecret: z.string().describe('OAuth client secret for the application'),
        redirectUri: z.string().describe('URI to redirect after authentication'),
        scopes: z.array(z.string()).describe('List of OAuth scopes to request'),
        accessToken: z.string().optional().describe('Existing access token if available'),
        refreshToken: z.string().optional().describe('Existing refresh token if available')
      });
      
      export type SDKOptions = z.infer<typeof SDKOptionsSchema>;
      
      /**
       * Check if an access token is valid
       */
      async function checkGenericTokenValidity(accessToken: string): Promise<boolean> {
        if (!accessToken) return false;
        
        try {
          // This is a generic implementation - replace with specific endpoint for your API
          const response = await fetch(\`\${TOKEN_INFO_URL}?access_token=\${accessToken}\`);
          return response.ok;
        } catch (error) {
          console.error('Error checking token validity:', error);
          return false;
        }
      }
      
      /**
       * Refresh an access token using a refresh token
       */
      async function refreshGenericAccessToken(
        refreshToken: string,
        clientId: string,
        clientSecret: string
      ): Promise<TokenResponse | null> {
        if (!refreshToken) return null;
        
        try {
          const params = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          });
          
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          
          if (!response.ok) return null;
          
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return null;
        }
      }
      
      /**
       * Exchange an authorization code for access and refresh tokens
       */
      export async function exchangeCodeForGenericTokens(
        code: string,
        clientId: string,
        clientSecret: string,
        redirectUri: string
      ): Promise<TokenResponse | null> {
        try {
          const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          });
      
          const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
      
          if (!response.ok) return null;
      
          const data = await response.json();
          return data as TokenResponse;
        } catch (error) {
          console.error('Error exchanging code for tokens:', error);
          return null;
        }
      }
    `;
  }
}

/**
 * Create initial package structure with empty files
 */
async function createInitialPackage(metadata: SDKMetadata): Promise<string> {
  // Convert @microfox/template-name to template-name for directory
  const dirName = metadata.packageName.replace('@microfox/', '');
  const packageDir = path.join(process.cwd(), '../packages', dirName);
  const srcDir = path.join(packageDir, 'src');

  // Create directories
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Create index.ts
  const indexContent = 'export * from "./sdk";';
  fs.writeFileSync(path.join(srcDir, 'index.ts'), indexContent);

  // Create empty sdk.ts as placeholder (will be updated by AI)
  fs.writeFileSync(
    path.join(srcDir, 'sdk.ts'),
    '// SDK content will be generated by AI',
  );

  // Create initial package.json
  const packageJson = createInitialPackageJson(
    metadata.packageName,
    metadata.description,
    metadata.title,
    metadata.keywords,
  );
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );

  // Create initial package-info.json
  const packageInfo = createInitialPackageInfo(
    metadata.packageName,
    metadata.title,
    metadata.description,
    '', // constructor name will be updated later
    [], // required API keys will be updated later
    metadata.authType === 'oauth2'
      ? 'oauth2'
      : metadata.authType === 'apiKey'
        ? 'apiKey'
        : 'auto', // auth type
    [], // functions will be updated later
  );
  fs.writeFileSync(
    path.join(packageDir, 'package-info.json'),
    JSON.stringify(packageInfo, null, 2),
  );

  // Create README.md placeholder
  fs.writeFileSync(
    path.join(packageDir, 'README.md'),
    `# ${metadata.title}\n\n${metadata.description}\n\nThis SDK was generated automatically.`,
  );

  // Create fixed files with predefined content
  await createFixedFiles(packageDir);

  return packageDir;
}

// Define the schema for the write_to_file tool
const WriteToFileSchema = z.object({
  sdkCode: z
    .string()
    .describe(
      'The entire TypeScript code for this SDK, which will be saved to sdk.ts file',
    ),
  constructorName: z
    .string()
    .describe(
      'The name of the constructor function or class that initializes this SDK (e.g., "createGoogleSheetsSDK").',
    ),
  requiredApiKeys: z
    .array(
      z.object({
        key: z
          .string()
          .describe(
            'Environment variable key name in uppercase format (e.g., "GOOGLE_API_KEY")',
          ),
        displayName: z
          .string()
          .describe(
            'Human-readable name for this API key shown in the UI (e.g., "Google API Key")',
          ),
        description: z
          .string()
          .describe(
            'Detailed description explaining what this key is used for and how to obtain it',
          ),
      }),
    )
    .describe(
      'List of required API keys needed for authentication with this SDK',
    ),
  authType: z
    .enum(['apiKey', 'oauth2', 'none'])
    .describe(
      'Authentication type for this SDK: "apiKey" for API key auth, "oauth2" for OAuth2 flow, or "none" for no auth required',
    ),
  functions: z
    .array(z.string())
    .describe('List of function names exposed by this SDK.'),
});

type WriteToFileData = z.infer<typeof WriteToFileSchema>;

// Define the schema for the run_command tool
const RunCommandSchema = z.object({
  dependencies: z.array(z.string()).describe('List of dependencies to install'),
  devDependencies: z
    .array(z.string())
    .describe('List of dev dependencies to install'),
});

type RunCommandData = z.infer<typeof RunCommandSchema>;

/**
 * Build the package
 */
async function buildPackage(packageDir: string): Promise<boolean> {
  try {
    const originalDir = process.cwd();
    process.chdir(packageDir);
    console.log(`⚙️ Building SDK package...`);
    await execAsync('npm run build');
    console.log(`✨ Build completed successfully!`);
    // Return to original directory
    process.chdir(originalDir);
    return true;
  } catch (error) {
    console.warn(
      `⚠️ Could not automatically build the package. Please build it manually.`,
    );
    return false;
  }
}

// Type for the final result
interface SDKResult {
  name: string;
  packageDir: string;
  packageName: string;
}

/**
 * Generate SDK based on arguments
 */
export async function generateSDK(
  args: GenerateSDKArgs,
): Promise<SDKResult | undefined> {
  try {
    console.log('🚀 Starting SDK generation process...');

    // Validate arguments
    const validatedArgs = GenerateSDKArgsSchema.parse(args);
    console.log('✅ Arguments validated successfully');

    // Generate metadata using Google Gemini Flash with structured output
    const metadata = await generateMetadata(validatedArgs.query);
    console.log(`📝 Generated metadata:`);
    console.log(`- API Name: ${metadata.apiName}`);
    console.log(`- Package: ${metadata.packageName}`);
    console.log(`- Title: ${metadata.title}`);
    console.log(`- Description: ${metadata.description}`);
    console.log(`- Keywords: ${metadata.keywords.join(', ')}`);
    console.log(`- Auth Type: ${metadata.authType}`);

    // Create initial package structure with empty files
    const packageDir = await createInitialPackage(metadata);
    console.log(`📁 Created initial package structure at ${packageDir}`);

    // Predefined URLs for documentation (can be customized based on the API)
    const urls = [
      `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get`,
      `https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet`,
      `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update`,
      `https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate`,
      `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append`,
      `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/clear`,
      `https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchClear`,
    ];

    // Scrape URLs for content
    console.log('🔍 Scraping URLs for API documentation...');
    const scrapedContent = await scrapeUrls(urls);
    console.log(`✅ Scraped ${scrapedContent.length} URLs`);

    // Create tool to handle file writing
    const writeToFileTool = tool({
      description: 'Write SDK code to sdk.ts file and update constructor info',
      parameters: WriteToFileSchema,
      execute: async (data: WriteToFileData) => {
        // Extract constructor name and functions from SDK code if not provided
        let constructorName = data.constructorName || '';
        let functions = data.functions || [];

        console.log('📝 Generated SDK with the following info:');
        console.log(`- Constructor: ${constructorName}`);
        console.log(`- Functions: ${functions.length}`);
        console.log(`- Auth Type: ${data.authType}`);

        // Get package directory
        console.log(`- Process directory: ${process.cwd()}`);
        const srcDir = path.join(
          process.cwd(),
          '../packages',
          metadata.packageName.replace('@microfox/', ''),
          'src',
        );

        // Update sdk.ts with generated code
        fs.writeFileSync(path.join(srcDir, 'sdk.ts'), data.sdkCode);

        // Update package-info.json with constructor info
        const packageInfoPath = path.join(packageDir, 'package-info.json');
        const packageInfo = JSON.parse(
          fs.readFileSync(packageInfoPath, 'utf8'),
        );

        // Update package-info with constructor info
        packageInfo.constructors = [
          {
            name: constructorName,
            description: `Create a new ${metadata.title} client through which you can interact with the API`,
            auth: data.authType,
            requiredKeys: data.requiredApiKeys,
            internalKeys: [],
            functionalities: functions,
          },
        ];

        // Update keysInfo
        packageInfo.keysInfo = data.requiredApiKeys.map(key => ({
          key: key.key,
          constructors: [constructorName],
          description: key.description,
          required: true,
        }));

        // Update functionalities
        packageInfo.readme_map.functionalities = functions;
        packageInfo.readme_map.title = `${constructorName} Microfox`;

        // Update extraInfo
        packageInfo.extraInfo = [
          `Use the \`${constructorName}\` constructor to create a new client.`,
        ];

        // Write updated package-info.json
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

        console.log(`✅ Updated SDK files at ${packageDir}`);

        return {
          success: true,
          packageDir,
          constructorName: constructorName,
        };
      },
    });

    // Create command tool to install dependencies
    const runCommandTool = tool({
      description: 'Install package dependencies',
      parameters: RunCommandSchema,
      execute: async (data: RunCommandData) => {
        // Get package directory
        const dirName = metadata.packageName.replace('@microfox/', '');
        const packageDir = path.join(process.cwd(), '../packages', dirName);

        if (data.dependencies && data.dependencies.length > 0) {
          console.log('📦 Installing dependencies...');
          const depsString = data.dependencies.join(' ');

          try {
            const originalDir = process.cwd();
            process.chdir(packageDir);
            await execAsync(`npm i ${depsString}`);

            // Update package.json with dependencies
            const packageJsonPath = path.join(packageDir, 'package.json');
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, 'utf8'),
            );

            // Write updated package.json
            fs.writeFileSync(
              packageJsonPath,
              JSON.stringify(packageJson, null, 2),
            );

            // Return to original directory
            process.chdir(originalDir);

            console.log(`✅ Installed dependencies: ${depsString}`);
          } catch (error) {
            console.error(`❌ Failed to install dependencies: ${error}`);
          }
        }

        if (data.devDependencies && data.devDependencies.length > 0) {
          console.log('📦 Installing dev dependencies...');
          const devDepsString = data.devDependencies.join(' ');

          try {
            const originalDir = process.cwd();
            process.chdir(packageDir);
            await execAsync(`npm i --save-dev ${devDepsString}`);

            // Update package.json with dev dependencies
            const packageJsonPath = path.join(packageDir, 'package.json');
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, 'utf8'),
            );

            // Write updated package.json
            fs.writeFileSync(
              packageJsonPath,
              JSON.stringify(packageJson, null, 2),
            );

            // Return to original directory
            process.chdir(originalDir);

            console.log(`✅ Installed dev dependencies: ${devDepsString}`);
          } catch (error) {
            console.error(`❌ Failed to install dev dependencies: ${error}`);
          }
        }

        // Update package-info.json with dependencies
        const packageInfoPath = path.join(packageDir, 'package-info.json');
        const packageInfo = JSON.parse(
          fs.readFileSync(packageInfoPath, 'utf8'),
        );

        // Update dependencies list in package-info.json (keep 'zod' and add new ones)
        if (data.dependencies && data.dependencies.length > 0) {
          packageInfo.dependencies = Array.from(
            new Set(['zod', ...data.dependencies]),
          );
        }

        // Write updated package-info.json
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

        return {
          success: true,
          packageDir,
          dependencies: data.dependencies,
          devDependencies: data.devDependencies,
        };
      },
    });

    // Get OAuth template code if needed
    let oauthTemplateCode = '';
    if (metadata.authType === 'oauth2' || metadata.authType === 'auto') {
      oauthTemplateCode = getOAuthTemplateCode(metadata.apiName) || '';
      if (metadata.authType === 'oauth2') {
        console.log(`📝 Including OAuth template code for ${metadata.apiName}`);
      } else {
        console.log(
          `📝 Preparing OAuth template code for ${metadata.apiName} in case it's needed`,
        );
      }
    }

    // Create system prompt and generation prompt
    const systemPrompt = dedent`
      You are a TypeScript SDK generator. Your task is to create a TypeScript SDK for an API based on documentation.
      
      You first carefully analyse the requirements, and then plan what needs to be done.
      You then critisize your plan, and then refine it to this specific task & keep maximum code in a single file.
      You then write the code for the task.

      Requirements:
      1. Use Zod for defining types with descriptive comments using .describe()
      2. DO NOT use Zod for validation of API responses
      3. The SDK should expose a constructor function or Class named "create${metadata.apiName.replace(/\s+/g, '')}SDK"
      4. Export all necessary types
      5. Handle error cases properly
      6. Include proper JSDoc comments
      7. Do not use axios or node-fetch dependencies, use nodejs20 default fetch instead

      ${
        metadata.authType === 'auto'
          ? `For authentication, analyze the API documentation to determine the appropriate auth type:
      - If the API mentions OAuth 2.0, client IDs, authorization codes, or redirect URIs, use "oauth2" auth type
      - If the API mentions API keys, access tokens, or API tokens, use "apiKey" auth type
      - If the API doesn't require authentication, use "none" auth type
      
      You must explicitly decide which auth type to implement based on the documentation.`
          : ''
      }

      ${
        metadata.authType === 'oauth2' || metadata.authType === 'auto'
          ? `
      For OAuth 2.0 implementation:
      - The OAuth credentials (clientId, clientSecret, etc.) should be required parameters in the constructor
      - Include optional access/refresh token parameters in the constructor
      - The constructor should check if the provided access token is valid
      - If the access token is invalid but refresh token is provided, try to refresh the access token
      - If no valid tokens are available, provide a method to generate an auth URL
      - Include a method to exchange authorization code for tokens
      - Bundle all OAuth functionality inside the SDK instance (not as separate exports)
      `
          : ''
      }

      Tool use:
      - To write the SDK code, use the write_to_file tool
        - You MUST provide a valid authType value from: "apiKey" (for API key authentication), "oauth2" (for OAuth flow), or "none" (for APIs that don't require auth)
        - For requiredApiKeys, provide detailed information including key names in UPPERCASE format
        - The sdkCode parameter should contain the complete TypeScript code for the SDK
      - To install dependencies, use the run_command tool
        - Only include dependencies that are actually needed beyond what's already installed
    `;

    const generationPrompt = dedent`
      You are requested to generate a TypeScript SDK for ${metadata.apiName} based on the following documentation.
      
      SDK Title: ${metadata.title}
      SDK Description: ${metadata.description}
      ${
        metadata.authType !== 'auto'
          ? `Auth Type: ${metadata.authType}`
          : `Auth Type: auto - Please determine the appropriate auth type based on:
        - Use "oauth2" if the API uses OAuth 2.0 flows
        - Use "apiKey" if the API uses API keys, tokens, or headers for auth
        - Use "none" if no auth is required`
      }
      
      Documentation:
      ${scrapedContent.join('\n\n---\n\n').substring(0, 50000)}
      
      The following packages are already installed in the project:

      - Dev dependencies:
        - @microfox/tsconfig
        - @types/node
        - tsup
        - typescript

      - Dependencies:
        - zod
      
      ${
        metadata.authType === 'oauth2'
          ? `OAuth 2.0 Template Code for ${metadata.apiName}:
      \`\`\`typescript
      ${oauthTemplateCode}
      \`\`\`
      
      Your SDK should integrate this OAuth template code into the constructor:
      - Make the OAuth credentials (clientId, clientSecret, redirectUri, scopes) required parameters
      - Accept optional access and refresh tokens in the constructor
      - Validate tokens automatically in the constructor
      - Refresh token if needed and possible
      - Provide a generateAuthUrl method to start OAuth flow if no valid tokens are available
      - Provide an exchangeCodeForTokens method to complete the OAuth flow
      - Include token handling as internal methods of the SDK class/instance
      `
          : metadata.authType === 'auto'
            ? `OAuth 2.0 Template Code (use only if you determine OAuth is needed):
      \`\`\`typescript
      ${oauthTemplateCode}
      \`\`\`
      
      If you determine that this API uses OAuth 2.0 for authentication, integrate this OAuth template code into the constructor:
      - Make the OAuth credentials (clientId, clientSecret, redirectUri, scopes) required parameters
      - Accept optional access and refresh tokens in the constructor
      - Validate tokens automatically in the constructor
      - Refresh token if needed and possible
      - Provide a generateAuthUrl method to start OAuth flow if no valid tokens are available
      - Provide an exchangeCodeForTokens method to complete the OAuth flow
      - Include token handling as internal methods of the SDK class/instance
      `
            : ''
      }
      
      Process:
      1. First analyze what dependencies you'll need and use run_command to install them
      2. Then generate the SDK code and use write_to_file to save it
    `;

    // Log prompts
    console.log('\n📋 System Prompt:', systemPrompt);
    console.log('\n📋 Generation Prompt:', generationPrompt);
    console.log('\n📋 System Prompt Length:', systemPrompt.length);
    console.log('\n📋 Generation Prompt Length:', generationPrompt.length);

    // Generate SDK code with Claude 3.5 Sonnet
    console.log('\n🧠 Generating SDK code...');
    const result = await generateText({
      model: models.claude35Sonnet,
      system: systemPrompt,
      prompt: generationPrompt,
      maxTokens: 5000,
      tools: {
        write_to_file: writeToFileTool,
        run_command: runCommandTool,
      },
      toolChoice: 'required',
      maxSteps: 2,
      onStepFinish: step => {
        console.log('step', step.usage);
      },
    });

    console.log('Usage:', result.usage);

    // Check for tool results
    if (!result.toolResults || result.toolResults.length === 0) {
      console.warn(
        '⚠️ No tool results received, SDK generation may have failed',
      );
      return undefined;
    }

    // Build the package
    console.log('🔨 Building the package...');
    await buildPackage(
      path.join(
        process.cwd(),
        '../packages',
        metadata.packageName.replace('@microfox/', ''),
      ),
    );

    return {
      name: metadata.apiName,
      packageDir: path.join(
        process.cwd(),
        '../packages',
        metadata.packageName.replace('@microfox/', ''),
      ),
      packageName: metadata.packageName,
    };
  } catch (error) {
    console.error('❌ Error generating SDK:', error);
    throw error;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const query = args.join(' ') || 'Google Sheets package';

  if (!query) {
    console.error('❌ Error: Query argument is required');
    console.log('Usage: node generate-sdk.js "API Name/Query"');
    process.exit(1);
  }

  generateSDK({ query })
    .then(result => {
      if (result) {
        console.log(`✅ SDK generation complete for ${result.packageName}`);
        console.log(`📂 Package location: ${result.packageDir}`);
      } else {
        console.log('⚠️ SDK generation completed with warnings');
      }
    })
    .catch(error => {
      console.error('❌ Fatal error generating SDK:', error);
      process.exit(1);
    });
}
