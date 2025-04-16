import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateText, tool } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';
import { buildPackage } from './utils';

const execAsync = promisify(exec);

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

// Interface for SDK metadata
interface SDKMetadata {
  apiName: string;
  packageName: string;
  title: string;
  description: string;
  authType: string;
  authSdk?: string;
}

/**
 * Generate detailed documentation for an SDK
 */
export async function generateReadme(
  sdkCode: string,
  sdkDocs: string,
  metadata: SDKMetadata,
  packageDir: string,
): Promise<boolean> {
  try {
    console.log('📝 Generating detailed documentation...');

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
      ${sdkCode}
      \`\`\`
      
      ## Basic Documentation
      ${sdkDocs}
      
      ## SDK Information
      - Title: ${metadata.title}
      - Description: ${metadata.description}
      - Auth Type: ${metadata.authType}
      ${metadata.authSdk ? `- Auth SDK: ${metadata.authSdk}` : ''}
      
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
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    return false;
  }
}

if (require.main === module) {
  const packageDir = path.join(__dirname, '../packages/reddit');
  const sdkCode = fs.readFileSync(path.join(packageDir, 'src/sdk.ts'), 'utf8');
  const sdkDocs = fs.readFileSync(path.join(packageDir, 'docs/sdk.md'), 'utf8');
  const metadata = {
    apiName: 'reddit',
    packageName: 'reddit',
    title: 'Reddit TypeScript SDK',
    description: 'A TypeScript SDK for interacting with the Reddit API',
    authType: 'oauth2',
    authSdk: '@microfox/reddit',
  };

  generateReadme(sdkCode, sdkDocs, metadata, packageDir);
}
