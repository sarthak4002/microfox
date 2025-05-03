import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import 'dotenv/config';
import { generateText, generateObject, tool } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';
import { generateDocs } from './genDocs';
import {
  extractLinks,
  analyzeLinks,
  extractContentFromUrls,
} from './utils/webScraper';
import { PackageInfo } from './types';

// Schema for SDK generation arguments
const GenerateSDKArgsSchema = z.object({
  query: z.string().describe('Query describing the API (e.g., "Github API")'),
  url: z
    .string()
    .url('Please provide a valid URL including the protocol (https://)')
    .describe('URL to scrape for API documentation'),
  isBaseUrl: z.boolean().describe('Whether the URL is the base URL'),
});

type GenerateSDKArgs = z.infer<typeof GenerateSDKArgsSchema>;

// Schema for SDK metadata
const SDKMetadataSchema = z.object({
  inputArgs: GenerateSDKArgsSchema,
  apiName: z.string().describe('A proper API name (e.g. "GitHub")'),
  packageName: z
    .string()
    .describe('Package name (@microfox/name in lowercase, kebab-case)'),
  title: z.string().describe('Microfox Name SDK title'),
  description: z.string().describe('A clear description of what this SDK does'),
  keywords: z.array(z.string()).describe('Relevant keywords for the package'),
  authType: z
    .enum(['oauth2', 'apikey', 'auto'])
    .describe(
      'Authentication type for this SDK: "oauth2" for OAuth 2.0 flow, "apikey" for API key authentication, or "auto" to let the model decide',
    ),
  authSdk: z
    .string()
    .optional()
    .describe(
      'The OAuth SDK to use (e.g., "@microfox/google-oauth"). Required when authType is "oauth2"',
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
export async function generateMetadata(
  query: GenerateSDKArgs,
): Promise<SDKMetadata> {
  console.log('🧠 Generating SDK metadata from query...');

  // Get available OAuth packages
  let oauthPackages = fs
    .readdirSync(path.join(__dirname, '../../packages'))
    .filter(dir => dir.includes('-oauth'));
  oauthPackages = oauthPackages.map(pkg => `@microfox/${pkg}`);
  console.log(
    `✅ Found ${oauthPackages.length} OAuth packages: ${oauthPackages.join(', ')}`,
  );

  const { object: metadata } = await generateObject({
    model: models.googleGeminiPro,
    schema: SDKMetadataSchema.omit({ inputArgs: true }),
    prompt: dedent`
      Generate metadata for a TypeScript SDK based on this query: "${query.query}"
      
      The package name should be lowercase, use kebab-case, and have the prefix "@microfox/".
      Make the description clear and concise.
      Include relevant keywords (3-4 total).
      
      For authType:
      - Use "oauth2" if the API primarily uses OAuth 2.0 for authentication (like Google, GitHub, or LinkedIn APIs)
      - Use "apikey" if the API primarily uses API keys or tokens for authentication
      - Use "auto" if you're not sure about the authentication mechanism
      
      For authSdk:
      - If authType is "oauth2", provide the appropriate OAuth SDK from the available packages
      - If authType is not "oauth2", leave this field empty
      
      Available OAuth packages: ${oauthPackages.join(', ')}
    `,
    temperature: 0.5,
  });

  let newMetadata: SDKMetadata = { ...metadata } as any;
  // Ensure required keywords are present
  newMetadata.keywords = ensureRequiredKeywords(metadata.keywords);
  newMetadata.inputArgs = query;

  console.log('✅ Generated metadata successfully');
  return newMetadata;
}

/**
 * Create package.json file
 */
function createInitialPackageJson(
  packageName: string,
  description: string,
  keywords: string[],
  authSdk?: string,
): any {
  return {
    name: packageName,
    version: '1.0.0',
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
      ...(authSdk ? { [authSdk]: '*' } : {}),
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
  authType: string,
  authSdk?: string,
): any {
  return {
    name: packageName,
    title,
    description,
    path: `packages/${packageName.replace('@microfox/', '')}`,
    dependencies: ['zod', authSdk],
    status: 'stable',
    authEndpoint:
      authType === 'oauth2' && authSdk
        ? `/connect/${authSdk.replace('@microfox/', '')}`
        : '',
    oauth2Scopes: [],
    documentation: `https://www.npmjs.com/package/${packageName}`,
    icon: `https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/${packageName.replace('@microfox/', '').replace('-', '-').replace('_', '-')}.svg`,
    readme_map: {
      path: '/README.md',
      description: `The full README for the ${title}`,
      functionalities: [],
    },
    constructors: [],
    keysInfo: [],
    extraInfo: [],
  } as PackageInfo;
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
 * Summarize content using Gemini to extract API information
 */
async function summarizeContent(
  content: string,
  query: string,
  options: { packageDir: string },
): Promise<string> {
  console.log('🧠 Summarizing content using Gemini...');

  const { text: summary, usage } = await generateText({
    model: models.googleGeminiPro,
    prompt: dedent`
      Analyze this API documentation and create a comprehensive summary that includes:
      1. All API endpoints with their HTTP methods
      2. Request headers and authentication requirements
      3. Request parameters and their types
      4. Response formats and data structures
      5. Authentication methods and required credentials
      6. Any other important information that would be useful for documentation generation

      ## User's query (VERY IMPORTANT): ${query}

      Format the summary in a clear, structured way that can be used to generate a TypeScript SDK.
      All API endpoints should be covered in the summary including the endpoint, method, authentication type, parameters, request body, response, and any other relevant information.
      If the user's query is about specific endpoints, make sure to include all the information needed for those endpoints in the summary.
      make sure each endpoint is given a brief description, based on the original content. 
      note down any edge cases as needed to build a robust SDK.
      the types are very important, make sure to include each and evry one in the summary.
      Focus on extracting the technical details needed for SDK implementation.
      Make sure to include all the information needed to generate a TypeScript SDK.
      Summary should be in markdown format.

      Documentation:
      ${content}
    `,
    maxTokens: 8000,
    temperature: 0.5,
  });

  console.log('✅ Content summarized successfully');
  console.log('Usage:', usage);

  const baseSummaryTextPath = path.join(options.packageDir, 'docSummary.md');
  fs.writeFileSync(baseSummaryTextPath, summary);

  return summary;
}

/**
 * Create initial package structure with empty files
 */
async function createInitialPackage(metadata: SDKMetadata): Promise<string> {
  // Convert @microfox/template-name to template-name for directory
  const dirName = metadata.packageName.replace('@microfox/', '');
  const packageDir = path.join(process.cwd(), '../packages', dirName);
  const srcDir = path.join(packageDir, 'src');
  const typesDir = path.join(srcDir, 'types');
  const schemasDir = path.join(srcDir, 'schemas');

  // Create directories
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  // Create index.ts with updated import
  fs.writeFileSync(
    path.join(srcDir, 'index.ts'),
    `// SDK content will be generated by AI`,
  );

  // Create empty types/index.ts as placeholder
  fs.writeFileSync(
    path.join(typesDir, 'index.ts'),
    '// Type definitions will be generated by AI',
  );

  // Create empty schemas/index.ts as placeholder
  fs.writeFileSync(
    path.join(schemasDir, 'index.ts'),
    '// Validation schemas will be generated by AI',
  );

  fs.writeFileSync(
    path.join(packageDir, 'package-builder.json'),
    JSON.stringify({ sdkMetadata: metadata }, null, 2),
  );
  // Create initial package.json
  const packageJson = createInitialPackageJson(
    metadata.packageName,
    metadata.description,
    metadata.keywords,
    metadata.authSdk,
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
    metadata.authType,
    metadata.authSdk,
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
const FileContentSchema = z.object({
  content: z
    .string()
    .describe(
      'The complete source code or text content of the file, including all necessary imports, types, and implementations',
    ),
  path: z
    .string()
    .describe(
      'The relative file path within the SDK package directory (e.g., src/index.ts, src/types/index.ts)',
    ),
});

const WriteToFileSchema = z.object({
  mainSdk: FileContentSchema.describe(
    'The main SDK implementation file details containing the API client class with authentication, API methods, and integration',
  ),
  types: FileContentSchema.describe(
    'TypeScript type definitions file details containing interfaces for configuration, responses, and other SDK-specific types',
  ),
  schemas: FileContentSchema.describe(
    'Zod validation schemas file details for runtime validation of inputs, outputs, and configuration objects',
  ),
  exports: FileContentSchema.describe(
    'Entry point file details that exports the main SDK class, types, and utilities for package consumers',
  ),
  setupInfo: z
    .string()
    .describe(
      'Additional information about the SDK that will be useful for documentation, such as how to obtain API keys, environment variables, or other important details not covered in the code',
    ),
  authType: z
    .enum(['apikey', 'oauth2', 'none'])
    .describe(
      'Authentication type for this SDK: "apikey" for API key auth, "oauth2" for OAuth2 flow, or "none" for no auth required',
    ),
  authSdk: z
    .string()
    .optional()
    .describe(
      'The name of the OAuth SDK to use (e.g., "@microfox/google-oauth", "@microfox/linkedin-oauth"). Required when authType is "oauth2".',
    ),
  oauth2Scopes: z
    .array(z.string())
    .optional()
    .describe(
      'Required OAuth2 scopes for this SDK (e.g., ["https://www.googleapis.com/auth/spreadsheets"]). Required Only when authType is "oauth2".',
    ),
});

type WriteToFileData = z.infer<typeof WriteToFileSchema>;

// Define the schema for the generate_docs tool
const GenerateDocsSchema = z.object({
  constructorDocs: z
    .object({
      name: z
        .string()
        .describe(
          'The name of the constructor function or class that initializes this SDK (e.g., "createGoogleSheetsSDK")',
        ),
      docs: z
        .string()
        .describe('The DETAILED markdown documentation for the constructor.'),
    })
    .describe(
      'The DETAILED markdown documentation for the constructor function or class that initializes this SDK (e.g., "createGoogleSheetsSDK").',
    ),
  functionsDocs: z
    .array(
      z.object({
        name: z
          .string()
          .describe('The name of the function (e.g., "createUser")'),
        docs: z
          .string()
          .describe(
            'The DETAILED markdown documentation for the function including all parameters, return type, usage examples, and more',
          ),
      }),
    )
    .describe(
      'The documentation for each function in this SDK, which will be saved to that specific function doc file like "createUser.md"',
    ),
  dependencies: z
    .array(z.string())
    .optional()
    .describe(
      "List of dependencies to install. Only include dependencies that are actually needed beyond what's already installed",
    ),
  devDependencies: z
    .array(z.string())
    .optional()
    .describe(
      "List of dev dependencies to install. Only include dev dependencies that are actually needed beyond what's already installed",
    ),
  envKeys: z
    .array(
      z.object({
        key: z
          .string()
          .describe(
            'Environment variable key name in uppercase format. Should be related to the provider, not the package (e.g., "GOOGLE_ACCESS_TOKEN" not "GOOGLE_SHEETS_ACCESS_TOKEN")',
          ),
        displayName: z
          .string()
          .describe(
            'Human-readable name for this API key shown in the UI (e.g., "Google Access Token")',
          ),
        description: z
          .string()
          .describe(
            'Detailed description explaining what this key is used for and how to obtain it',
          ),
        required: z.boolean().describe('Whether this key is required'),
      }),
    )
    .describe(
      'List of required API keys needed for authentication with this SDK',
    ),
});

type GenerateDocsData = z.infer<typeof GenerateDocsSchema>;

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
    const metadata = await generateMetadata(validatedArgs);
    console.log(`📝 Generated metadata:`);
    console.log(`- API Name: ${metadata.apiName}`);
    console.log(`- Package: ${metadata.packageName}`);
    console.log(`- Title: ${metadata.title}`);
    console.log(`- Description: ${metadata.description}`);
    console.log(`- Keywords: ${metadata.keywords.join(', ')}`);
    console.log(`- Auth Type: ${metadata.authType}`);
    if (metadata.authSdk) {
      console.log(`- Auth SDK: ${metadata.authSdk}`);
    }

    // Create initial package structure with empty files
    const packageDir = await createInitialPackage(metadata);
    console.log(`📁 Created initial package structure at ${packageDir}`);

    // Extract links from the provided URL
    const allLinks = await extractLinks(validatedArgs.url);

    // Analyze links to find useful ones for package creation
    const usefulLinks = await analyzeLinks(allLinks, validatedArgs.query, {
      isBaseUrl: args.isBaseUrl,
      url: args.url,
      packageDir: packageDir,
    });
    console.log(`🔍 Found ${usefulLinks.length} useful links`);
    console.log(usefulLinks);

    // Extract content from useful links
    const scrapedContents = await extractContentFromUrls(usefulLinks, {
      packageDir,
      baseUrl: args.url,
    });
    // Combine all scraped content into a single document
    const combinedContent = scrapedContents
      .map(content => `## Content from: ${content.url}\n\n${content.content}`)
      .join('\n\n---\n\n');

    // Generate a single summary from all the combined content
    const docsSummary = await summarizeContent(
      combinedContent,
      validatedArgs.query,
      {
        packageDir,
      },
    );

    let oauthPackages = fs
      .readdirSync(path.join(__dirname, '../../packages'))
      .filter(dir => dir.includes('-oauth'));
    console.log(`✅ Found ${oauthPackages.length} OAuth packages`);
    oauthPackages = oauthPackages.map(pkg => `@microfox/${pkg}`);

    // Get OAuth package README if authType is oauth2
    let oauthPackageReadme = '';
    if (metadata.authType === 'oauth2' && metadata.authSdk) {
      const oauthPackageName = metadata.authSdk.replace('@microfox/', '');
      const oauthReadmePath = path.join(
        __dirname,
        '../../packages',
        oauthPackageName,
        'README.md',
      );

      if (fs.existsSync(oauthReadmePath)) {
        oauthPackageReadme = fs.readFileSync(oauthReadmePath, 'utf8');
        console.log(`✅ Found OAuth package README for ${metadata.authSdk}`);
      } else {
        console.warn(
          `⚠️ OAuth package README not found for ${metadata.authSdk}`,
        );
      }
    }

    // Create tool to handle file writing
    const writeToFileTool = tool({
      description:
        'Write SDK code to multiple files and provide extra information for documentation',
      parameters: WriteToFileSchema,
      execute: async (data: WriteToFileData) => {
        console.log('📝 Generated SDK with the following info:');
        console.log(`- Auth Type: ${data.authType}`);
        if (data.authSdk) {
          console.log(`- Auth SDK: ${data.authSdk}`);
        }
        if (data.oauth2Scopes && data.oauth2Scopes.length > 0) {
          console.log(`- OAuth2 Scopes: ${data.oauth2Scopes.join(', ')}`);
        }
        //console.log(`- Extra Info Items: ${data.extraInfo.length}`);

        // Get package directory
        const dirName = metadata.packageName.replace('@microfox/', '');
        const packageDir = path.join(process.cwd(), '../packages', dirName);

        // Write the generated files
        const files = [
          {
            content: data.mainSdk.content,
            path: path.join(packageDir, data.mainSdk.path),
          },
          {
            content: data.types.content,
            path: path.join(packageDir, data.types.path),
          },
          {
            content: data.schemas.content,
            path: path.join(packageDir, data.schemas.path),
          },
          {
            content: data.exports.content,
            path: path.join(packageDir, data.exports.path),
          },
        ];

        for (const file of files) {
          await fs.promises.writeFile(file.path, file.content + '\n');
          console.log(`✅ Created ${path.relative(packageDir, file.path)}`);
        }

        // Update package-info.json with auth info and extra info
        const packageInfoPath = path.join(packageDir, 'package-info.json');
        const packageInfo: PackageInfo = JSON.parse(
          fs.readFileSync(packageInfoPath, 'utf8'),
        );

        // Add authEndpoint
        packageInfo.authEndpoint =
          data.authType === 'oauth2' && data?.authSdk
            ? `/connect/${data?.authSdk.replace('@microfox/', '')}`
            : '';
        packageInfo.authType = data.authType;
        packageInfo.oauth2Scopes = data.oauth2Scopes || [];

        // Add extraInfo
        packageInfo.keyInstructions = {
          link: packageInfo.keyInstructions?.link || '',
          setupInfo: data.setupInfo,
        };

        // Write updated package-info.json
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

        console.log(`✅ Updated SDK files at ${packageDir}`);

        return {
          success: true,
          packageDir,
          sdkImplementation: {
            mainSdk: data.mainSdk,
            types: data.types,
            schemas: data.schemas,
            exports: data.exports,
          },
          extraInfo: [data.setupInfo],
        };
      },
    });

    // Create system prompt and generation prompt
    const systemPrompt = dedent`
      You are a TypeScript SDK generator. Your task is to create a TypeScript SDK for an API based on documentation.
      
      ## Process
      1. First carefully analyze the requirements and API documentation
      2. Plan what needs to be done, including:
         - Determining the authentication method
         - Identifying ALL API endpoints and their parameters
         - Planning the SDK structure and methods covering all endpoints
      3. Criticize your plan and refine it to be specific to this task
      4. Write complete, production-ready code with no TODOs or placeholders
      5. Recheck your code for any linting or TypeScript errors
      6. Make sure the SDK is easy to use and follows best practices
      
      ## Core Requirements for the SDK Code Generation
      1. Use Zod for defining types with descriptive comments using .describe()
      2. DO NOT use Zod for validation or parsing of API and function responses
      3. The SDK should expose a constructor function or Class named "create${metadata.apiName.replace(/\s+/g, '')}SDK"
      4. The SDK MUST have functions for ALL endpoints mentioned in the documentation
      5. The Functions MUST cover all endpoints and their parameters
      6. A Single Function can be used to call multiple similar endpoints by combining the parameters of the endpoints
      7. The SDK should abstract as much as possible of the API's complexity, so that the API can be easily used by any developer.
      8. The parameters of constructor and functions should be as much abstracted as possible, so that the developer can pass in the parameters in the way that is most convenient for them.
      9. The SDK should be as clean, customizable and reusable as possible
      10. Export all necessary types
      11. Handle error cases properly so that the developer can easily understand what went wrong
      12. Do not use axios or node-fetch dependencies, use nodejs20 default fetch instead
      13. Provide comprehensive extraInfo for documentation generation

      ## Project Structure & Requirements
      1. Main SDK (mainSdk):
         - Path: src/[packageName]Sdk.ts
         - Must include all API methods and authentication handling
         - Complete implementation with proper error handling
         - Follow TypeScript best practices

      2. Type Definitions (types):
         - Path: src/types/index.ts
         - All necessary interfaces and types
         - Proper JSDoc documentation
         - Export everything needed by the SDK

      3. Validation Schemas (schemas):
         - Path: src/schemas/index.ts
         - Zod schemas matching type definitions
         - Comprehensive validation rules
         - Clear error messages

      4. Package Exports (exports):
         - Path: src/index.ts
         - Export main SDK class
         - Re-export types (must be: export * from './types')
         - Do not re-export schemas
      
      Each component must be properly typed, documented, and follow best practices for security and error handling.

      ## Authentication Implementation
      ${
        metadata.authType === 'auto'
          ? `You must analyze the API documentation to determine the appropriate auth type:
      - Use "oauth2" if the API uses OAuth 2.0 flows (client IDs, authorization codes, redirect URIs)
      - Use "apikey" if the API uses API keys, tokens, or headers for auth
      - Use "none" if no auth is required
      
      You must explicitly decide which auth type to implement based on the documentation.`
          : `The authentication type is set to "${metadata.authType}".`
      }

      ${
        metadata.authType === 'oauth2' || metadata.authType === 'auto'
          ? `
      ## OAuth 2.0 Implementation Guidelines
      - The SDK should accept all the parameters required by the OAuth package and the SDK itself in the constructor including accessToken, refreshToken(if supported by the provider), clientId, clientSecret, redirectUri, and scopes.
      - The SDK should export functions to validate and refresh the access token which uses the functions from the OAuth package constructor
      - The SDK should check if the provided access token is valid and if not, throw an error

      ## OAuth Integration
      - You must provide the appropriate oauth2Scopes values which fully cover the scopes required by every function in the sdk in the write_to_file tool
      - You must install the OAuth package in the project
      - The environment variable names should be related to the provider, not the package (e.g., "GOOGLE_ACCESS_TOKEN" not "GOOGLE_SHEETS_ACCESS_TOKEN")
      `
          : ''
      }

      ## Tool Usage
      - To write the SDK code, use the write_to_file tool with the following parameters (all are objects, do not pass strings):
        - mainSdk: The mainSdk OBJECT with separate code and paths for main SDK
        - types: The types OBJECT with separate code and paths for types file
        - schemas: The schemas OBJECT with separate code and paths for schemas file
        - exports: The exports OBJECT with separate code and paths for exports file
        - setupInfo: Additional information for documentation (e.g., how to obtain API keys, environment variables, rate limits, etc.)
        - authType: Authentication type ("apikey", "oauth2", or "none")
        - oauth2Scopes: Required an array of OAuth2 scopes (required when authType is "oauth2")
    `;
    // ## IMPORTANT: Example of the expected input schema for the write_to_file tool:
    // {
    //     "mainSdk": {
    //       "content": "// Main SDK implementation code here...",
    //       "path": "src/exampleOAuthSdk.ts"
    //     },
    //     "types": {
    //       "content": "// Type definitions here...",
    //       "path": "src/types/index.ts"
    //     },
    //     "schemas": {
    //       "content": "// Validation schemas here...",
    //       "path": "src/schemas/index.ts"
    //     },
    //     "exports": {
    //       "content": "// Exports here...",
    //       "path": "src/index.ts"
    //     },
    //     "authType": "oauth2",
    //     "oauth2Scopes": [
    //       "https://example.com/auth/scope1",
    //       "https://example.com/auth/scope2"
    //     ],
    //     "extraInfo": [
    //       "Information about how to obtain credentials...",
    //       "Information about environment variables..."
    //     ]
    // }

    const generationPrompt = dedent`
      You are requested to generate a TypeScript SDK for ${metadata.apiName} based on the following documentation.

      ## User's query (VERY IMPORTANT)
      ${validatedArgs.query}
      
      ## SDK Information
      - Title: ${metadata.title}
      - Description: ${metadata.description}
      ${
        metadata.authType !== 'auto'
          ? `- Auth Type: ${metadata.authType}`
          : `- Auth Type: auto - Please determine the appropriate auth type based on:
            - Use "oauth2" if the API uses OAuth 2.0 flows
            - Use "apikey" if the API uses API keys, tokens, or headers for auth
            - Use "none" if no auth is required`
      }
      ${metadata.authSdk ? `- Auth SDK: ${metadata.authSdk}` : ''}
      
      ## API Documentation Summary
      ${docsSummary}

      ${
        oauthPackageReadme
          ? `
      ## OAuth Package Documentation
      ${oauthPackageReadme}

      use direct string literals for the scopes array, do not use enums if possible
      `
          : ''
      }
      
      ## Available Dependencies
      The following packages are already installed in the project:

      - Dev dependencies:
        - @microfox/tsconfig
        - @types/node
        - tsup
        - typescript

      - Dependencies:
        - zod
        ${metadata?.authSdk ? `- ${metadata?.authSdk}` : ''}
      
      ## SDK Requirements
      - Create a complete, production-ready SDK with no TODOs or placeholders
      - Ensure all types are properly defined with Zod
      - Include comprehensive error handling
      - Make sure the SDK is easy to use and follows best practices
      - Create a function for EVERY endpoint mentioned in the documentation
      - Provide comprehensive extraInfo for documentation generation
      - Make sure all the types are followed correctly in the code, and not mismatched
      
      ${
        metadata.authType === 'oauth2' || metadata.authType === 'auto'
          ? `
      ## OAuth Implementation Requirements
      - The SDK should accept parameters like accessToken, refreshToken, clientId, clientSecret, redirectUri, and scopes based on the OAuth package documentation
      - The SDK should export functions to validate and refresh the access token which uses the functions exported from the OAuth package
      - The SDK should check if the provided access token is valid and if not, throw an error
      - The environment variable names should be related to the provider, not the package (e.g., "GOOGLE_ACCESS_TOKEN" not "GOOGLE_SHEETS_ACCESS_TOKEN")
      `
          : ''
      }
      
      ## setupInfo Requirements
      - Provide detailed information about how to obtain API keys or credentials
      - Include information about environment variables and how to set them up
      - Add any other important information not covered in the code that would be useful for documentation
      - Explain authentication requirements and how to obtain necessary credentials
      - Provide information about rate limits and other important constraints
    `;

    // Log prompts
    console.log('\n📋 System Prompt:', systemPrompt);
    console.log('\n📋 Generation Prompt:', generationPrompt);
    console.log('\n📋 System Prompt Length:', systemPrompt.length);
    console.log('\n📋 Generation Prompt Length:', generationPrompt.length);

    // Generate SDK code with Claude 3.5 Sonnet
    console.log('\n🧠 Generating SDK code...');
    const result = await generateObject({
      model: models.claude35Sonnet,
      system: systemPrompt,
      prompt: generationPrompt,
      maxTokens: 8000,
      schema: WriteToFileSchema,
    });

    const writeToFileToolResult = await writeToFileTool.execute(result.object, {
      toolCallId: Date.now().toString(),
      messages: [],
    });

    console.log('Usage:', result.usage);

    // Get the SDK code and extraInfo from the first generation
    const sdkResult = writeToFileToolResult;
    if (!sdkResult || !sdkResult.success) {
      console.warn('⚠️ SDK generation failed');
      return undefined;
    }

    const combinedCode = `
    // Main SDK (src/[packageName]Sdk.ts)
    ${sdkResult.sdkImplementation.mainSdk.content}\n\n
    // Types (src/types/index.ts)
    ${sdkResult.sdkImplementation.types.content}\n\n
    // Schemas (src/schemas/index.ts)
    ${sdkResult.sdkImplementation.schemas.content}\n\n
    // Exports (src/index.ts)
    ${sdkResult.sdkImplementation.exports.content}
    `;
    // Generate documentation
    await generateDocs(
      combinedCode,
      {
        apiName: metadata.apiName,
        packageName: metadata.packageName,
        title: metadata.title,
        description: metadata.description,
        authType: metadata.authType,
        authSdk: metadata.authSdk,
      },
      packageDir,
      sdkResult.extraInfo,
    );

    const foxlog = fs.readFileSync(
      path.join(
        process.cwd()?.replace('/scripts', ''),
        '.microfox/packagefox-build.json',
      ),
      'utf8',
    );
    if (foxlog) {
      const foxlogData = JSON.parse(foxlog);
      const newRequests: any[] = [
        {
          type: 'build-issues',
          packageName: metadata.packageName,
        },
      ];
      foxlogData.requests.forEach((request: any) => {
        if (request.url === validatedArgs.url && request.type === 'feature') {
        } else {
          newRequests.push(request);
        }
      });
      foxlogData.requests = newRequests;
      fs.writeFileSync(
        path.join(process.cwd(), '.microfox/packagefox-build.json'),
        JSON.stringify(foxlogData, null, 2),
      );
    }

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
  const queryArg = args[0] || '';
  const urlArg = args[1] || '';
  const isBaseUrlArg = args[2] || '';

  if (!queryArg) {
    console.error('❌ Error: Query argument is required');
    console.log('Usage: node generate-sdk.js "API Name/Query" "URL to scrape"');
    process.exit(1);
  }

  if (!urlArg) {
    console.error('❌ Error: URL argument is required');
    console.log('Usage: node generate-sdk.js "API Name/Query" "URL to scrape"');
    process.exit(1);
  }

  generateSDK({
    query: queryArg,
    url: urlArg,
    isBaseUrl: isBaseUrlArg?.toLowerCase() === 'baseurl',
  })
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
