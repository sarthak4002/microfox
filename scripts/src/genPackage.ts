import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateText, generateObject, tool } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';
import { SDK_QUERY } from './constants';
import scrapedContents from './scraped-content.json';
import { generateReadme } from './genDocs';

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
  authSdk: z
    .string()
    .optional()
    .describe('The OAuth SDK to use (e.g., "@microfox/google-oauth")'),
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

  // Get available OAuth packages
  let oauthPackages = fs
    .readdirSync(path.join(__dirname, '../../packages'))
    .filter(dir => dir.includes('-oauth'));
  oauthPackages = oauthPackages.map(pkg => `@microfox/${pkg}`);
  console.log(
    `✅ Found ${oauthPackages.length} OAuth packages: ${oauthPackages.join(', ')}`,
  );

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
      
      For authSdk:
      - If authType is "oauth2", provide the appropriate OAuth SDK from the available packages
      - If authType is not "oauth2", leave this field empty
      
      Available OAuth packages: ${oauthPackages.join(', ')}
    `,
    temperature: 0.2,
  });

  // Ensure required keywords are present
  metadata.keywords = ensureRequiredKeywords(metadata.keywords);

  console.log('✅ Generated metadata successfully');
  return metadata;
}

/**
 * Create package.json file
 */
function createInitialPackageJson(
  packageName: string,
  description: string,
  keywords: string[],
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
    dependencies: ['zod'],
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
    },
    constructors: [],
    keysInfo: [],
    extraInfo: [],
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
const WriteToFileSchema = z.object({
  sdkCode: z
    .string()
    .describe(
      'The entire TypeScript code for this SDK, which will be saved to sdk.ts file',
    ),
  sdkDocs: z
    .string()
    .describe(
      'The entire documentation for this SDK, which will be saved to README.md file.',
    ),
  authType: z
    .enum(['apiKey', 'oauth2', 'none'])
    .describe(
      'Authentication type for this SDK: "apiKey" for API key auth, "oauth2" for OAuth2 flow, or "none" for no auth required',
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
        .describe(
          'The DETAILED markdown documentation for the constructor function or class that initializes this SDK (e.g., "createGoogleSheetsSDK").',
        ),
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
            'Environment variable key name in uppercase format (e.g., "GOOGLE_ACCESS_TOKEN")',
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
    if (metadata.authSdk) {
      console.log(`- Auth SDK: ${metadata.authSdk}`);
    }

    // Create initial package structure with empty files
    const packageDir = await createInitialPackage(metadata);
    console.log(`📁 Created initial package structure at ${packageDir}`);

    let oauthPackages = fs
      .readdirSync(path.join(__dirname, '../../packages'))
      .filter(dir => dir.includes('-oauth'));
    console.log(`✅ Found ${oauthPackages.length} OAuth packages`);
    oauthPackages = oauthPackages.map(pkg => `@microfox/${pkg}`);
    console.log(oauthPackages);

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
        'Write SDK code to sdk.ts file and update basic documentation',
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

        // Get package directory
        console.log(`- Process directory: ${process.cwd()}`);
        const dirName = metadata.packageName.replace('@microfox/', '');
        const packageDir = path.join(process.cwd(), '../packages', dirName);
        const srcDir = path.join(packageDir, 'src');

        // Update sdk.ts with generated code
        fs.writeFileSync(path.join(srcDir, 'sdk.ts'), data.sdkCode);

        // Update README.md with generated documentation
        fs.writeFileSync(path.join(packageDir, 'README.md'), data.sdkDocs);

        // Update package-info.json with auth info
        const packageInfoPath = path.join(packageDir, 'package-info.json');
        const packageInfo = JSON.parse(
          fs.readFileSync(packageInfoPath, 'utf8'),
        );

        // Add authEndpoint
        packageInfo.authEndpoint =
          data.authType === 'oauth2' && data?.authSdk
            ? `/connect/${data?.authSdk.replace('@microfox/', '')}`
            : '';
        packageInfo.oauth2Scopes = data.oauth2Scopes || [];

        // Write updated package-info.json
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

        console.log(`✅ Updated SDK files at ${packageDir}`);

        return {
          success: true,
          packageDir,
          sdkCode: data.sdkCode,
          sdkDocs: data.sdkDocs,
        };
      },
    });

    // Create tool to generate detailed documentation
    const generateDocsTool = tool({
      description: 'Generate detailed documentation for the SDK',
      parameters: GenerateDocsSchema,
      execute: async (data: GenerateDocsData) => {
        const constructorName = data.constructorDocs.name;

        console.log(
          '📝 Generated detailed documentation with the following info:',
        );
        console.log(`- Constructor: ${constructorName}`);
        console.log(`- Functions: ${data.functionsDocs.length}`);

        // Get package directory
        const dirName = metadata.packageName.replace('@microfox/', '');
        const packageDir = path.join(process.cwd(), '../packages', dirName);
        const docsDir = path.join(packageDir, 'docs');

        // Create docs directory if it doesn't exist
        if (!fs.existsSync(docsDir)) {
          fs.mkdirSync(docsDir, { recursive: true });
        }

        // Save constructor documentation file
        fs.writeFileSync(
          path.join(docsDir, `${constructorName}.md`),
          data.constructorDocs.docs,
        );

        // Save function documentation files
        for (const func of data.functionsDocs) {
          fs.writeFileSync(path.join(docsDir, `${func.name}.md`), func.docs);
        }

        // Update package-info.json with constructor info
        const packageInfoPath = path.join(packageDir, 'package-info.json');
        const packageInfo = JSON.parse(
          fs.readFileSync(packageInfoPath, 'utf8'),
        );

        // Add readme_map
        packageInfo.readme_map = {
          title: `@microfox/${metadata.packageName} README`,
          description: `The full README for the ${metadata.title}`,
          path: '/README.md',
          constructors: [
            {
              name: constructorName,
              description: `The documentation for the constructor ${constructorName} that initializes this SDK.`,
              path: `/docs/${constructorName}.md`,
            },
          ],
          functionalities: data.functionsDocs.map(f => ({
            name: f.name,
            description: `The documentation for the ${f.name} function.`,
            path: `/docs/${f.name}.md`,
          })),
        };

        // Add constructor info
        packageInfo.constructors = [
          {
            name: constructorName,
            description: `Create a new ${metadata.title} client through which you can interact with the API`,
            auth: packageInfo.authEndpoint ? 'oauth2' : 'apiKey',
            authSdk: packageInfo.authEndpoint
              ? packageInfo.authEndpoint.replace('/connect/', '@microfox/')
              : '',
            outputKeys: [],
            requiredKeys: !packageInfo.authEndpoint
              ? data.envKeys.map(key => ({
                  key: key.key,
                  displayName: key.displayName,
                  description: key.description,
                }))
              : [],
            internalKeys: packageInfo.authEndpoint
              ? data.envKeys.map(key => ({
                  key: key.key,
                  displayName: key.displayName,
                  description: key.description,
                }))
              : [],
            functionalities: data.functionsDocs.map(f => f.name),
          },
        ];

        // Add keysInfo
        packageInfo.keysInfo = data.envKeys.map(key => ({
          key: key.key,
          constructors: [constructorName],
          description: key.description,
          required: key.required,
        }));

        // Add extraInfo
        packageInfo.extraInfo = [
          `Use the \`${constructorName}\` constructor to create a new client.`,
        ];

        // Install dependencies if provided
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

            // Add new dependencies to package.json
            for (const dep of data.dependencies) {
              const [name, version] = dep.split('@');
              packageJson.dependencies[name] = version || '^1.0.0';
            }

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

        // Install dev dependencies if provided
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

            // Add new dev dependencies to package.json
            for (const dep of data.devDependencies) {
              const [name, version] = dep.split('@');
              packageJson.devDependencies[name] = version || '^1.0.0';
            }

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
        if (data.dependencies && data.dependencies.length > 0) {
          packageInfo.dependencies = Array.from(
            new Set(['zod', ...data.dependencies.map(d => d.split('@')[0])]),
          );
        }

        // Write updated package-info.json
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

        console.log(`✅ Updated documentation files at ${packageDir}`);

        // Build the package
        console.log('🔨 Building the package...');
        await buildPackage(packageDir);

        return {
          success: true,
          packageDir,
          constructorName: constructorName,
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
         - Identifying required API endpoints and their parameters
         - Planning the SDK structure and methods
      3. Criticize your plan and refine it to be specific to this task
      4. Write complete, production-ready code with no TODOs or placeholders
      5. Recheck your code for any linting or TypeScript errors
      6. Make sure the SDK is easy to use and follows best practices
      
      ## Core Requirements for the SDK Code Generation
      1. Use Zod for defining types with descriptive comments using .describe()
      2. DO NOT use Zod for validation of API responses
      3. The SDK should expose a constructor function or Class named "create${metadata.apiName.replace(/\s+/g, '')}SDK"
      4. The SDK should have functions for all the endpoints mentioned in the documentation
      5. The SDK should abstract as much as possible of the API's complexity, so that the API can be easily used by any developer.
      6. The parameters of constructor and functions should be as much abstracted as possible, so that the developer can pass in the parameters in the way that is most convenient for them.
      7. The SDK should be as clean, customizable and reusable as possible
      8. The SDK should be well documented with JSDoc comments
      9. Export all necessary types
      10. Handle error cases properly so that the developer can easily understand what went wrong
      11. Do not use axios or node-fetch dependencies, use nodejs20 default fetch instead

      ## Authentication Implementation
      ${
        metadata.authType === 'auto'
          ? `You must analyze the API documentation to determine the appropriate auth type:
      - Use "oauth2" if the API uses OAuth 2.0 flows (client IDs, authorization codes, redirect URIs)
      - Use "apiKey" if the API uses API keys, tokens, or headers for auth
      - Use "none" if no auth is required
      
      You must explicitly decide which auth type to implement based on the documentation.`
          : `The authentication type is set to "${metadata.authType}".`
      }

      ${
        metadata.authType === 'oauth2' || metadata.authType === 'auto'
          ? `
      ## OAuth 2.0 Implementation Guidelines
      - The SDK should accept accessToken, refreshToken, clientId, and clientSecret as parameters in the constructor
      - The SDK should export functions to validate and refresh the access token which uses the functions exported from the OAuth package
      - The SDK should check if the provided access token is valid and if not, throw an error

      ## OAuth Integration
      - You must provide the appropriate authSdk value in the write_to_file tool
      - You must provide the appropriate oauth2Scopes values which fully cover the scopes required by the functions in the sdk in the write_to_file tool
      - You must install the OAuth package in the project
      - The environment variable names should be related to the provider, not the package (e.g., "GOOGLE_ACCESS_TOKEN" not "GOOGLE_SHEETS_ACCESS_TOKEN")
      `
          : ''
      }

      ## Tool Usage
      - To write the SDK code, use the write_to_file tool with the following parameters:
        - sdkCode: The complete TypeScript code for the SDK
        - sdkDocs: The complete documentation for the SDK in Markdown format
        - authType: Authentication type ("apiKey", "oauth2", or "none")
        - authSdk: The OAuth SDK to use (required when authType is "oauth2")
        - oauth2Scopes: Required OAuth2 scopes (required when authType is "oauth2")
      
      - The write_to_file tool will:
        1. Save the SDK code to sdk.ts
        2. Save the documentation to README.md
        3. Update package-info.json with auth info
    `;

    const generationPrompt = dedent`
      You are requested to generate a TypeScript SDK for ${metadata.apiName} based on the following documentation.
      
      ## SDK Information
      - Title: ${metadata.title}
      - Description: ${metadata.description}
      ${
        metadata.authType !== 'auto'
          ? `- Auth Type: ${metadata.authType}`
          : `- Auth Type: auto - Please determine the appropriate auth type based on:
            - Use "oauth2" if the API uses OAuth 2.0 flows
            - Use "apiKey" if the API uses API keys, tokens, or headers for auth
            - Use "none" if no auth is required`
      }
      ${metadata.authSdk ? `- Auth SDK: ${metadata.authSdk}` : ''}
      
      ## API Documentation
      ${(() => {
        const averageLength = Math.floor(100000 / scrapedContents.length);

        return scrapedContents
          .map(content => {
            const truncatedContent = content.content.substring(
              0,
              averageLength,
            );
            return `URL: ${content.url}\n\nCONTENT: ${truncatedContent}`;
          })
          .join('\n\n---\n\n');
      })().substring(0, 100000)}

      ${
        metadata.authType === 'oauth2' && oauthPackageReadme
          ? `
      ## OAuth Package Documentation
      ${oauthPackageReadme}
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
      
      ## SDK Requirements
      - Create a complete, production-ready SDK with no TODOs or placeholders
      - Ensure all types are properly defined with Zod
      - Include comprehensive error handling
      - Add detailed JSDoc comments for all functions and types
      - Make sure the SDK is easy to use and follows best practices
      
      ${
        metadata.authType === 'oauth2' || metadata.authType === 'auto'
          ? `
      ## OAuth Implementation Requirements
      - The SDK should accept accessToken, refreshToken, clientId, and clientSecret as parameters in the constructor
      - The SDK should export functions to validate and refresh the access token which uses the functions exported from the OAuth package
      - The SDK should check if the provided access token is valid and if not, throw an error
      - The environment variable names should be related to the provider, not the package (e.g., "GOOGLE_ACCESS_TOKEN" not "GOOGLE_SHEETS_ACCESS_TOKEN")
      `
          : ''
      }
      
      ## Documentation Requirements
      - Create comprehensive documentation for the SDK in the sdkDocs parameter
      - Include examples of how to use the SDK in the documentation
      - Explain authentication requirements and how to obtain necessary credentials
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
      maxTokens: 8000,
      tools: {
        write_to_file: writeToFileTool,
      },
      toolChoice: 'required',
      maxSteps: 1,
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

    // Get the SDK code and docs from the first generation
    const sdkResult = result.toolResults[0].result;
    if (!sdkResult || !sdkResult.success) {
      console.warn('⚠️ SDK generation failed');
      return undefined;
    }

    // Get auth information from the tool call arguments
    const sdkArgs = result.toolResults[0].args;

    // Create system prompt for documentation generation
    const docsSystemPrompt = dedent`
      You are a documentation generator for a TypeScript SDK. Your task is to create detailed documentation for the SDK based on the provided code and basic documentation.
      
      ## Process
      1. First carefully analyze the SDK code and basic documentation
      2. Identify the constructor and all functions in the SDK
      3. Create detailed documentation for the constructor and each function
      4. Make sure the documentation is comprehensive and easy to understand
      
      ## Core Requirements for the Documentation Generation
      1. The constructorDocs should have a detailed description of the constructor, including the parameters, initialization, usage examples, and more
      2. The functionsDocs should have a detailed documentation for the functions, including the parameters, return type, usage examples, and more
      3. The functionDocs should have sections for Authentication, Usage, Parameters, and more
      4. The documentation should be well written with Markdown format and should be well organized and easy to understand
      5. The documentation should include examples of how to use the SDK
      6. The documentation should explain authentication requirements and how to obtain necessary credentials
      
      ## Tool Usage
      - To generate the documentation, use the generate_docs tool with the following parameters:
        - constructorDocs: The constructor name and documentation
        - functionsDocs: An array of objects with function names and their documentation
        - dependencies: Optional array of dependencies to install
        - devDependencies: Optional array of dev dependencies to install
        - envKeys: Array of environment variable keys needed for authentication
      
      - The generate_docs tool will:
        1. Save constructor documentation to docs/constructor_name.md
        2. Save function documentation to docs/function_name.md files
        3. Update package-info.json with constructor info
        4. Install any dependencies you specify
        5. Build the package
    `;

    const docsGenerationPrompt = dedent`
      You are requested to generate detailed documentation for a TypeScript SDK based on the following code and basic documentation.
      
      ## SDK Code
      \`\`\`typescript
      ${sdkResult.sdkCode}
      \`\`\`
      
      ## Basic Documentation
      ${sdkResult.sdkDocs}
      
      ## SDK Information
      - Title: ${metadata.title}
      - Description: ${metadata.description}
      - Auth Type: ${sdkArgs.authType || metadata.authType}
      ${sdkArgs.authSdk ? `- Auth SDK: ${sdkArgs.authSdk}` : ''}
      
      ## Documentation Requirements
      - Create detailed documentation for the constructor and each function
      - Include examples of how to use the SDK in the documentation
      - Explain authentication requirements and how to obtain necessary credentials
    `;

    // Generate documentation with Claude 3.5 Sonnet
    console.log('\n🧠 Generating detailed documentation...');
    const docsResult = await generateText({
      model: models.claude35Sonnet,
      system: docsSystemPrompt,
      prompt: docsGenerationPrompt,
      maxTokens: 8000,
      tools: {
        generate_docs: generateDocsTool,
      },
      toolChoice: 'required',
      maxSteps: 1,
      onStepFinish: step => {
        console.log('step', step.usage);
      },
    });

    console.log('Usage:', docsResult.usage);

    // Check for tool results
    if (!docsResult.toolResults || docsResult.toolResults.length === 0) {
      console.warn(
        '⚠️ No tool results received, documentation generation may have failed',
      );
      return undefined;
    }

    // Generate documentation
    await generateReadme(
      sdkResult.sdkCode,
      sdkResult.sdkDocs,
      {
        apiName: metadata.apiName,
        packageName: metadata.packageName,
        title: metadata.title,
        description: metadata.description,
        authType: metadata.authType,
        authSdk: metadata.authSdk,
      },
      packageDir,
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
  const queryArg = args.join(' ') || SDK_QUERY;

  if (!queryArg) {
    console.error('❌ Error: Query argument is required');
    console.log('Usage: node generate-sdk.js "API Name/Query"');
    process.exit(1);
  }

  generateSDK({ query: queryArg })
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
