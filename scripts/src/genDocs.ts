import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateObject, generateText } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';
import { buildPackage } from './utils/execCommands';
import { updateDocReport } from './octokit/octokit';
import { logUsage } from './octokit/usageLogger';
import { inMemoryStore } from './utils/InMemoryStore';
import { tool } from 'ai';
import { CoreTool } from 'ai';

const execAsync = promisify(exec);

// --- Tool Schemas ---

const SaveConstructorDocsSchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the constructor function or class that initializes the SDK',
    ),
  description: z
    .string()
    .describe(
      "A comprehensive description of the constructor's purpose, functionality, and behavior",
    ),
  docs: z
    .string()
    .describe(
      'Complete markdown documentation for the constructor including all parameters, return types, and examples',
    ),
});
type ConstructorDocsData = z.infer<typeof SaveConstructorDocsSchema>;

const SaveFunctionDocsSchema = z.object({
  name: z.string().describe('The name of the function being documented'),
  description: z
    .string()
    .describe(
      'A detailed description of what the function does and how it works',
    ),
  docs: z
    .string()
    .describe(
      'Complete markdown documentation for the function including all parameters, return types, and examples',
    ),
});
type FunctionDocsData = z.infer<typeof SaveFunctionDocsSchema>;

const SaveEnvKeysSchema = z.object({
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
            'Detailed description explaining what this key is for and how to obtain it',
          ),
        required: z.boolean().describe('Whether this key is required'),
      }),
    )
    .optional()
    .default([])
    .describe(
      'List of required API keys needed for authentication with this SDK',
    ),
});
type EnvKeysData = z.infer<typeof SaveEnvKeysSchema>;

const SaveDependenciesSchema = z.object({
  dependencies: z
    .array(z.string())
    .optional()
    .default([])
    .describe(
      "List of dependencies to install. Only include dependencies that are actually needed beyond what's already installed",
    ),
  devDependencies: z
    .array(z.string())
    .optional()
    .default([])
    .describe(
      "List of dev dependencies to install. Only include dev dependencies that are actually needed beyond what's already installed",
    ),
});
type DependenciesData = z.infer<typeof SaveDependenciesSchema>;

// Define the schema for the overall expected output AFTER assembly
const FinalDocsSchema = z.object({
  constructorDocs: SaveConstructorDocsSchema,
  functionsDocs: z.array(SaveFunctionDocsSchema),
  envKeys: SaveEnvKeysSchema.shape.envKeys,
  dependencies: SaveDependenciesSchema.shape.dependencies,
  devDependencies: SaveDependenciesSchema.shape.devDependencies,
});
type FinalDocsData = z.infer<typeof FinalDocsSchema>;

// Interface for SDK metadata
interface SDKMetadata {
  apiName: string;
  packageName: string;
  title: string;
  description: string;
  authType: string;
  authSdk?: string;
}

// Helper type for storing function docs
type StoredFunctionDocs = { [functionName: string]: FunctionDocsData };

/**
 * Generate detailed documentation for an SDK using tool calls
 */
export async function generateDocs(
  code: string,
  metadata: SDKMetadata,
  packageDir: string,
  extraInfo: string[] = [],
): Promise<boolean> {
  const storeKeyBase = `docs:${metadata.packageName}`;
  const constructorStoreKey = `${storeKeyBase}:constructor`;
  const functionsStoreKey = `${storeKeyBase}:functions`;
  const envKeysStoreKey = `${storeKeyBase}:envKeys`;
  const dependenciesStoreKey = `${storeKeyBase}:dependencies`;

  // --- Clear previous data for this package ---
  console.log(
    `🧹 Clearing previous documentation data for ${metadata.packageName}...`,
  );
  inMemoryStore.removeItem(constructorStoreKey);
  inMemoryStore.removeItem(functionsStoreKey);
  inMemoryStore.removeItem(envKeysStoreKey);
  inMemoryStore.removeItem(dependenciesStoreKey);

  try {
    // Update documentation report - start generation
    await updateDocReport(
      'generate',
      {
        status: 'in-progress',
        details: {
          package: metadata.packageName,
          title: metadata.title,
        },
      },
      packageDir,
    );

    // Update the system prompt to instruct tool usage
    const docsSystemPrompt = dedent`
      You are a professional documentation generator for TypeScript SDKs. Your task is to analyze the provided SDK code and generate comprehensive documentation by calling the available tools.

      ## Process
      1. Carefully analyze the SDK code, schemas, types, and extra information provided in the user prompt.
      2. Identify the main constructor/class.
      3. Call the \`saveConstructorDocs\` tool with the documentation for the constructor.
      4. Identify ALL functions available in the SDK (exported or methods on the main class).
      5. For EACH function, call the \`saveFunctionDocs\` tool with its detailed documentation.
      6. Identify any necessary environment variables based on the code and auth type. Call the \`saveEnvKeys\` tool. If none, call it with an empty array.
      7. Identify any necessary external dependencies or devDependencies needed beyond standard Node/TS. Call the \`saveDependencies\` tool. If none, call it with empty arrays.
      8. Ensure you have called the appropriate tool for the constructor and EVERY function.
      9. Once ALL documentation components (constructor, ALL functions, env keys, dependencies) have been saved using the tools, call the \`finalizeDocs\` tool to signal completion. DO NOT call \`finalizeDocs\` before saving documentation for every component.

      ## Documentation Format & Standards
      When generating the content for the \`docs\` field in the tools, adhere strictly to the following markdown format and standards:

      ### Constructor Documentation (\`saveConstructorDocs\`)
      - Follow the detailed structure provided in the user prompt's "Constructor Documentation" section.
      - Include configuration examples using environment variables where appropriate.

      ### Function Documentation (\`saveFunctionDocs\`)
      - Follow the detailed structure provided in the user prompt's "Function Documentation" section for EACH function.
      - Include parameters, return values, detailed type expansions (inline), and examples.
      - Expand ALL types inline until primitive types are reached. NEVER refer to external types. Document ALL possible values.
      - Examples should demonstrate functionality clearly using mock data and descriptive placeholders. DO NOT include constructor initialization in function examples.

      ### Environment Variables (\`saveEnvKeys\`)
      - Provide the key name, display name, description, and required status for each.
      - Follow the specific naming conventions for OAuth2 variables mentioned in the user prompt (e.g., GOOGLE_ACCESS_TOKEN, not package-specific names).

      ### Dependencies (\`saveDependencies\`)
      - List only dependencies NOT typically included or already present.

      ## Important Rules
      - Call the tools sequentially as you generate each piece of documentation.
      - You MUST call \`saveFunctionDocs\` for EVERY function found in the SDK code.
      - You MUST call \`saveConstructorDocs\` for the main constructor/class.
      - You MUST call \`saveEnvKeys\` and \`saveDependencies\` (even if empty).
      - You MUST call \`finalizeDocs\` ONLY after all other tool calls are complete.
      - Generate complete and accurate information for each tool call according to the schemas and documentation standards.
      - Adhere strictly to the type expansion and documentation standards outlined in the user prompt.
    `;

    // Generation prompt remains largely the same, focusing on the source material
    const docsGenerationPrompt = dedent`
      Generate comprehensive documentation for the TypeScript SDK below by calling the provided tools (\`saveConstructorDocs\`, \`saveFunctionDocs\`, \`saveEnvKeys\`, \`saveDependencies\`, \`finalizeDocs\`). Call the appropriate save tool for the constructor and EACH function, then call finalize. Adhere strictly to the documentation standards outlined in the system prompt.

      ## Package Name
      ${metadata.packageName}

      ## Package Code
      \`\`\`typescript
      ${code}
      \`\`\`

      ## Extra Information
      ${extraInfo.join('\n\n')}

      ## SDK Information
      - Title: ${metadata.title}
      - Description: ${metadata.description}
      - Auth Type: ${metadata.authType}
      ${metadata.authSdk ? `- Auth SDK: ${metadata.authSdk}` : ''}

      ## Documentation Standards Reminder (Summarized from System Prompt)
      - **Constructor/Function Docs**: Use the detailed markdown format. Include Purpose, Parameters, Return Value, Examples.
      - **Type Expansion**: Expand ALL types inline down to primitives. Document ALL possible values. NO external references.
      - **Env Keys**: Provide key, displayName, description, required status. Use generic names for OAuth2 (e.g., GOOGLE_ACCESS_TOKEN).
      - **Dependencies**: List only extra needed dependencies.
      - **Tool Order**: Call save tools for constructor, ALL functions, env keys, dependencies. Then call \`finalizeDocs\`.
    `;

    let allToolsCalled = false;
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    // Define the tools for the AI
    const tools: Record<string, CoreTool<any, any>> = {
      saveConstructorDocs: tool({
        description:
          'Saves the generated documentation for the SDK constructor or main class.',
        parameters: SaveConstructorDocsSchema,
        execute: async (data: ConstructorDocsData) => {
          console.log(`💾 Saving constructor docs: ${data.name}`);
          inMemoryStore.setItem(constructorStoreKey, data);
          return `Constructor documentation for ${data.name} saved.`;
        },
      }),
      saveFunctionDocs: tool({
        description:
          'Saves the generated documentation for a single SDK function.',
        parameters: SaveFunctionDocsSchema,
        execute: async (data: FunctionDocsData) => {
          console.log(`💾 Saving function docs: ${data.name}`);
          const existingFunctions =
            inMemoryStore.getItem<StoredFunctionDocs>(functionsStoreKey) || {};
          existingFunctions[data.name] = data;
          inMemoryStore.setItem(functionsStoreKey, existingFunctions);
          return `Function documentation for ${data.name} saved.`;
        },
      }),
      saveEnvKeys: tool({
        description:
          'Saves the list of environment variables required by the SDK.',
        parameters: SaveEnvKeysSchema,
        execute: async (data: EnvKeysData) => {
          console.log(`💾 Saving env keys: ${data.envKeys?.length || 0} keys`);
          const keysToSave = data.envKeys ?? [];
          inMemoryStore.setItem(envKeysStoreKey, keysToSave);
          return `Environment keys saved (${keysToSave.length} keys).`;
        },
      }),
      saveDependencies: tool({
        description:
          'Saves the list of external dependencies and devDependencies required by the SDK.',
        parameters: SaveDependenciesSchema,
        execute: async (data: DependenciesData) => {
          console.log(
            `💾 Saving dependencies: ${data.dependencies?.length || 0} deps, ${data.devDependencies?.length || 0} devDeps`,
          );
          const depsToSave = {
            dependencies: data.dependencies ?? [],
            devDependencies: data.devDependencies ?? [],
          };
          inMemoryStore.setItem(dependenciesStoreKey, depsToSave);
          return `Dependencies saved (${depsToSave.dependencies.length} deps, ${depsToSave.devDependencies.length} devDeps).`;
        },
      }),
      finalizeDocs: tool({
        description:
          'Signals that all documentation components (constructor, all functions, env keys, dependencies) have been generated and saved using the other tools.',
        parameters: z.object({}),
        execute: async () => {
          console.log(
            '🏁 FinalizeDocs tool called. Documentation generation complete.',
          );
          allToolsCalled = true;
          return 'Documentation generation process finalized.';
        },
      }),
    };

    // Generate documentation using tool calls
    console.log('\n🧠 Generating detailed documentation via tool calls...');
    try {
      const result = await generateText({
        model: models.googleGeminiPro,
        system: docsSystemPrompt,
        prompt: docsGenerationPrompt,
        tools: tools,
        toolChoice: 'required',
        maxSteps: 20,
        maxRetries: 3,
      });

      if (result.usage) {
        usage = result.usage;
        logUsage(models.googleGeminiPro.modelId, usage);
        console.log('Usage:', usage);
      } else {
        console.warn('Usage information not available from the stream result.');
      }

      if (!allToolsCalled) {
        throw new Error(
          'AI did not call the finalizeDocs tool. Documentation may be incomplete.',
        );
      }
      await updateDocReport(
        'generate',
        {
          status: 'success',
          details: {
            'Generated Docs': result.toolCalls.length,
          },
        },
        packageDir,
      );
    } catch (e) {
      console.error('Error during AI documentation generation:', e);
      await updateDocReport(
        'generate',
        {
          status: 'failure',
          error: e instanceof Error ? e.message : String(e),
        },
        packageDir,
      );
      throw e;
    }

    // --- Retrieve and Assemble Data from Store ---
    console.log('🧩 Assembling documentation from storage...');
    const constructorData =
      inMemoryStore.getItem<ConstructorDocsData>(constructorStoreKey);
    const functionsMap =
      inMemoryStore.getItem<StoredFunctionDocs>(functionsStoreKey) || {};
    const envKeysData =
      inMemoryStore.getItem<EnvKeysData['envKeys']>(envKeysStoreKey) || [];
    const dependenciesData = inMemoryStore.getItem<DependenciesData>(
      dependenciesStoreKey,
    ) || { dependencies: [], devDependencies: [] };

    // --- Basic Validation ---
    if (!constructorData) {
      throw new Error(
        'Failed to retrieve constructor documentation from store.',
      );
    }
    if (Object.keys(functionsMap).length === 0) {
      console.warn(
        '⚠️ No function documentation was saved. This might be expected if the SDK has no functions, or it might indicate an issue.',
      );
    }

    // Assemble into the final structure
    const assembledData: FinalDocsData = {
      constructorDocs: constructorData,
      functionsDocs: Object.values(functionsMap),
      envKeys: envKeysData,
      dependencies: dependenciesData.dependencies,
      devDependencies: dependenciesData.devDependencies,
    };

    // --- Proceed with existing logic using assembledData ---
    try {
      // Update documentation report - validation step (using assembled data)
      await updateDocReport(
        'validate',
        {
          status: 'success',
          details: {
            'Total Tokens': usage.totalTokens,
            'Constructor Docs': assembledData.constructorDocs.docs.length,
            'Functions Docs': assembledData.functionsDocs.length,
            'Env Keys': assembledData.envKeys?.length || 0,
          },
        },
        packageDir,
      );

      const validatedData = assembledData;
      const constructorName = validatedData.constructorDocs.name;

      console.log(
        '📝 Assembled documentation successfully with the following info:',
      );
      console.log(`- Constructor: ${constructorName}`);
      console.log(`- Functions: ${validatedData.functionsDocs.length}`);
      console.log(`- Environment Keys: ${validatedData.envKeys?.length || 0}`);

      // Get package directory
      const docsDir = path.join(packageDir, 'docs');

      // Create docs directory if it doesn't exist
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      // Save constructor documentation file
      fs.writeFileSync(
        path.join(docsDir, `${constructorName}.md`),
        `${validatedData.constructorDocs.docs}`,
      );

      // Save function documentation files
      for (const func of validatedData.functionsDocs) {
        const safeFuncName = func.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (safeFuncName !== func.name) {
          console.warn(
            `⚠️ Sanitized function name "${func.name}" to "${safeFuncName}" for filename.`,
          );
        }
        if (!safeFuncName) {
          console.error(
            `❌ Invalid function name found: "${func.name}". Skipping file write.`,
          );
          continue;
        }
        fs.writeFileSync(path.join(docsDir, `${safeFuncName}.md`), func.docs);
      }

      // Update documentation report - save step
      await updateDocReport(
        'save',
        {
          status: 'success',
          details: {
            constructor: constructorName,
            functions: validatedData.functionsDocs.length,
            envKeys: validatedData.envKeys?.length || 0,
          },
        },
        packageDir,
      );

      // Update package-info.json with constructor info
      const packageInfoPath = path.join(packageDir, 'package-info.json');
      const packageInfo = JSON.parse(fs.readFileSync(packageInfoPath, 'utf8'));

      const safeFunctionNames = validatedData.functionsDocs
        .map(f => f.name.replace(/[^a-zA-Z0-9_-]/g, '_'))
        .filter(Boolean);

      // Add readme_map
      packageInfo.readme_map = {
        title: metadata.title,
        description: `The full README for the ${metadata.title}`,
        path:
          'https://github.com/microfox-ai/microfox/blob/main/packages/' +
          metadata.packageName.replace('@microfox/', '') +
          '/README.md',
        functionalities: [
          constructorName,
          ...validatedData.functionsDocs.map(f => f.name),
        ],
        all_readmes: [
          {
            path:
              'https://github.com/microfox-ai/microfox/blob/main/packages/' +
              metadata.packageName.replace('@microfox/', '') +
              '/docs/' +
              constructorName +
              '.md',
            type: 'constructor',
            extension: 'md',
            functionality: constructorName,
            description:
              validatedData?.constructorDocs?.description ||
              'The full README for the ' + metadata.title + ' constructor',
          },
          ...validatedData.functionsDocs.map((f, index) => ({
            path:
              'https://github.com/microfox-ai/microfox/blob/main/packages/' +
              metadata.packageName.replace('@microfox/', '') +
              '/docs/' +
              safeFunctionNames[index] +
              '.md',
            type: 'functionality',
            extension: 'md',
            functionality: f.name,
            description:
              f.description ||
              'The full README for the ' +
                metadata.title +
                ' ' +
                f.name +
                ' functionality',
          })),
        ],
      };

      console.log('searching for the logo');
      const logoDir = path.join(__dirname, '../../logos');
      let listItemsInDirectory: string[] = [];
      if (fs.existsSync(logoDir)) {
        listItemsInDirectory = fs.readdirSync(logoDir);
      } else {
        console.warn(`Logo directory not found: ${logoDir}`);
      }

      if (listItemsInDirectory.length > 0) {
        try {
          const { object: logo } = await generateObject({
            model: models.googleGeminiPro,
            system: `You are a helpful assistant that searches the correct logo file slug (without extension) for the package based on its title and description. Pick the most relevant logo slug from the provided list. If no relevant logo is found, do not return a logo slug.`,
            prompt: `Available logo file slugs (without extensions like .svg): ${listItemsInDirectory.map(f => f.replace('.svg', '')).join(', ')}. Pick the most appropriate logo slug for the package titled "${packageInfo.title}" with description: "${packageInfo.description}".`,
            schema: z.object({
              logo: z
                .string()
                .describe(
                  'Picked slug of the logo (e.g., "google-sheets", "slack")',
                )
                .optional(),
            }),
          });
          console.log('logo picked:', logo);
          if (logo.logo) {
            const logoFileName = listItemsInDirectory.find(f =>
              f.startsWith(logo.logo + '.'),
            );
            if (logoFileName) {
              packageInfo.icon = `https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/${logoFileName}`;
              console.log(`Icon set to: ${packageInfo.icon}`);
            } else {
              console.warn(
                `Selected logo slug "${logo.logo}" does not correspond to a file in the logos directory.`,
              );
            }
          }
        } catch (logoError) {
          console.error('Error generating logo suggestion:', logoError);
        }
      } else {
        console.log('No logos found in directory to select from.');
      }

      console.log('Setting a better description for the package');
      try {
        const { object: description } = await generateObject({
          model: models.googleGeminiPro,
          system: `You are a helpful assistant that refines package descriptions. Generate a concise and informative description (max 1-2 sentences) for the package based on its title and functionalities.`,
          prompt: `Package Title: "${packageInfo.title}". Current Description: "${packageInfo.description}". Supported Functionalities: ${validatedData.functionsDocs.map(f => f.name).join(', ')}. Generate an improved, concise description.`,
          schema: z.string().describe('The improved package description.'),
        });
        if (description && description.trim().length > 0) {
          packageInfo.description = description.trim();
          console.log('New description:', packageInfo.description);
        } else {
          console.warn('Generated description was empty, keeping original.');
        }
      } catch (descError) {
        console.error('Error generating better description:', descError);
      }

      // Add constructor info
      packageInfo.constructors = [
        {
          name: constructorName,
          description: `Create a new ${metadata.title} client through which you can interact with the API`,
          auth: metadata.authType,
          ...(metadata.authType === 'apikey' && {
            apiType: 'api_key',
          }),
          ...(metadata.authType === 'oauth2' && {
            authSdk: metadata.authSdk,
          }),
          ...(metadata.authType === 'oauth2' &&
            packageInfo.authEndpoint && {
              authEndpoint: packageInfo.authEndpoint,
            }),
          requiredKeys: !packageInfo.authEndpoint
            ? validatedData.envKeys.map(key => ({
                key: key.key,
                displayName: key.displayName,
                description: key.description,
                required: key.required,
                ...(key.key.includes('SCOPES') &&
                  packageInfo.oauth2Scopes && {
                    defaultValue: packageInfo.oauth2Scopes,
                  }),
              }))
            : [],
          internalKeys: packageInfo.authEndpoint
            ? validatedData.envKeys.map(key => ({
                key: key.key,
                displayName: key.displayName,
                description: key.description,
                required: key.required,
                ...(key.key.includes('SCOPES') &&
                  packageInfo.oauth2Scopes && {
                    defaultValue: packageInfo.oauth2Scopes,
                  }),
              }))
            : [],
          functionalities: validatedData.functionsDocs.map(f => f.name),
        },
      ];

      // Add keysInfo
      packageInfo.keysInfo = validatedData.envKeys.map(key => ({
        key: key.key,
        constructors: [constructorName],
        description: key.description,
        required: key.required,
        ...(key.key.includes('SCOPES') &&
          packageInfo.oauth2Scopes && {
            defaultValue: packageInfo.oauth2Scopes,
          }),
      }));

      // Add extraInfo
      packageInfo.extraInfo = extraInfo;

      // Install dependencies if provided
      const depsString = validatedData.dependencies?.join(' ') || '';
      const devDepsString = validatedData.devDependencies?.join(' ') || '';

      try {
        const originalDir = process.cwd();
        if (!fs.existsSync(packageDir)) {
          throw new Error(`Package directory does not exist: ${packageDir}`);
        }
        process.chdir(packageDir);
        if (depsString) {
          console.log('📦 Installing dependencies...', depsString);
          await execAsync(`npm i ${depsString} --save --save-exact`);
          console.log(`✅ Installed dependencies: ${depsString}`);
        }
        if (devDepsString) {
          console.log('📦 Installing dev dependencies...', devDepsString);
          await execAsync(`npm i ${devDepsString} --save-dev --save-exact`);
          console.log(`✅ Installed dev dependencies: ${devDepsString}`);
        }
        process.chdir(originalDir);
      } catch (error) {
        console.error(`❌ Failed to install dependencies: ${error}`);
        await updateDocReport(
          'build',
          {
            status: 'failure',
            error: `Dependency installation failed: ${error instanceof Error ? error.message : String(error)}`,
          },
          packageDir,
        );
      }

      // Update package.json with newly installed dependencies
      const packageJsonPath = path.join(packageDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      packageInfo.dependencies = Object.keys(packageJson?.dependencies || {});
      packageInfo.devDependencies = Object.keys(
        packageJson?.devDependencies || {},
      );

      // Write updated package-info.json
      fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));
      console.log(`📝 Updated ${packageInfoPath}`);

      // Generate README.md
      const readmeContent = generateMainReadme(
        metadata,
        validatedData.constructorDocs,
        validatedData.functionsDocs,
        validatedData.envKeys || [],
        extraInfo,
      );
      fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent);
      console.log(`📝 Generated README.md at ${packageDir}`);

      console.log(
        `✅ Updated documentation files and package info at ${packageDir}`,
      );

      // --- Final Cleanup ---
      console.log(
        `🧹 Cleaning up temporary documentation data for ${metadata.packageName}...`,
      );
      inMemoryStore.removeItem(constructorStoreKey);
      inMemoryStore.removeItem(functionsStoreKey);
      inMemoryStore.removeItem(envKeysStoreKey);
      inMemoryStore.removeItem(dependenciesStoreKey);
    } catch (error) {
      // Update documentation report - error case during processing/build
      console.error(
        '❌ Error processing documentation or building package:',
        error,
      );
      // --- Cleanup on Error ---
      console.log(
        `🧹 Cleaning up temporary documentation data for ${metadata.packageName} after error...`,
      );
      inMemoryStore.removeItem(constructorStoreKey);
      inMemoryStore.removeItem(functionsStoreKey);
      inMemoryStore.removeItem(envKeysStoreKey);
      inMemoryStore.removeItem(dependenciesStoreKey);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('❌ Top-level error during documentation generation:', error);
    try {
      await updateDocReport(
        'generate',
        {
          status: 'failure',
          error: `Unhandled error: ${error instanceof Error ? error.message : String(error)}`,
        },
        packageDir,
      );
    } catch (reportError) {
      console.error(
        'Failed to update report after top-level error:',
        reportError,
      );
    }

    // --- Cleanup on Error ---
    console.log(
      `🧹 Cleaning up temporary documentation data for ${metadata.packageName} after top-level error...`,
    );
    inMemoryStore.removeItem(constructorStoreKey);
    inMemoryStore.removeItem(functionsStoreKey);
    inMemoryStore.removeItem(envKeysStoreKey);
    inMemoryStore.removeItem(dependenciesStoreKey);

    return false;
  }
}

/**
 * Generate README.md content
 */
function generateMainReadme(
  metadata: SDKMetadata,
  constructorDocs: { name: string; docs: string },
  functionsDocs: Array<{ name: string; docs: string }>,
  envKeys: Array<{
    key: string;
    displayName: string;
    description: string;
    required: boolean;
  }>,
  extraInfo: string[],
): string {
  const { title, description, packageName } = metadata;

  const constructorName = constructorDocs.name;
  const safeConstructorName = constructorName.replace(/[^a-zA-Z0-9_-]/g, '_');

  let content = `# ${title}\n\n${description}\n\n`;

  let installPackages = [packageName];
  if (metadata.authType === 'oauth2' && metadata.authSdk) {
    installPackages.push(metadata.authSdk);
  }

  content += `## Installation\n\n\`\`\`bash\nnpm install ${installPackages.join(' ')}\n\`\`\`\n\n`;

  if (envKeys && envKeys.length > 0) {
    content += `## Environment Variables\n\n`;
    content += `To use this package, you need to set the following environment variables:\n\n`;

    for (const key of envKeys) {
      content += `- \`${key.key}\`: ${key.description} ${key.required ? '** (Required)**' : '(Optional)'}\n`;
    }

    content += `\n`;
  } else {
    content += `## Environment Variables\n\nThis package does not require any environment variables.\n\n`;
  }

  content += '## API Reference\n\n';
  content +=
    'For detailed documentation on the constructor and all available functions, please refer to the following files:\n\n';

  content += `- [**${constructorName}** (Constructor)](./docs/${safeConstructorName}.md): Initializes the client.\n`;

  for (const func of functionsDocs) {
    const safeFuncName = func.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (safeFuncName) {
      content += `- [${func.name}](./docs/${safeFuncName}.md)\n`;
    }
  }
  content += '\n';

  return content;
}

if (require.main === module) {
  (async () => {
    const packageName = process.argv[2];
    if (!packageName) {
      console.error('Please provide a package name as an argument');
      process.exit(1);
    }

    const packageDir = path.join(__dirname, '../../packages', packageName);

    if (!fs.existsSync(packageDir)) {
      console.error(`Package directory not found: ${packageDir}`);
      process.exit(1);
    }

    const srcDir = path.join(packageDir, 'src');
    let tsFiles: string[] = [];
    if (fs.existsSync(srcDir)) {
      tsFiles = fs
        .readdirSync(srcDir)
        .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
        .map(file => path.join('src', file));
    } else {
      console.warn(
        `Source directory not found: ${srcDir}. Cannot read TS files.`,
      );
      process.exit(1);
    }

    let combinedCode = '';
    for (const file of tsFiles) {
      const filePath = path.join(packageDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        combinedCode += `\n// --- File: ${file} ---\n${fileContent}\n`;
      } catch (readError) {
        console.error(`Error reading file ${filePath}:`, readError);
        process.exit(1);
      }
    }

    if (!combinedCode.trim()) {
      console.error('No TypeScript code found in src directory.');
      process.exit(1);
    }

    const packageInfoPath = path.join(packageDir, 'package-info.json');
    let packageInfo: any;
    try {
      packageInfo = JSON.parse(fs.readFileSync(packageInfoPath, 'utf8'));
    } catch (jsonError) {
      console.error(`Error reading or parsing ${packageInfoPath}:`, jsonError);
      process.exit(1);
    }

    const constructors = packageInfo.constructors || [];
    const firstConstructor = constructors[0] || {};

    const metadata: SDKMetadata = {
      apiName: packageInfo.name || packageName,
      packageName: packageInfo.name || packageName,
      title: packageInfo.title || 'Untitled Package',
      description: packageInfo.description || 'No description available.',
      authType: firstConstructor.auth || 'none',
      ...(firstConstructor.auth === 'oauth2' &&
        firstConstructor.authSdk && {
          authSdk: firstConstructor.authSdk,
        }),
    };

    const extraInfo = packageInfo.extraInfo || [];

    try {
      const success = await generateDocs(
        combinedCode,
        metadata,
        packageDir,
        extraInfo,
      );
      if (success) {
        console.log(
          `\n✅ Successfully generated documentation for ${packageName}`,
        );
      } else {
        console.error(
          `\n❌ Failed to generate documentation for ${packageName}`,
        );
        process.exitCode = 1;
      }
    } catch (docError) {
      console.error(
        `\n❌ Unhandled exception during generateDocs for ${packageName}:`,
        docError,
      );
      process.exitCode = 1;
    }
  })();
}
