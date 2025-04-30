import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateObject } from 'ai';
import { models } from './ai/models';
import dedent from 'dedent';
import { buildPackage } from './utils/execCommands';

const execAsync = promisify(exec);

// Define the schema for documentation generation
const GenerateDocsSchema = z.object({
  constructorDocs: z.object({
    name: z.string().describe('The name of the constructor function or class that initializes the SDK'),
    description: z.string().describe('A comprehensive description of the constructor\'s purpose, functionality, and behavior'),
    docs: z.string().describe('Complete markdown documentation for the constructor including all parameters, return types, and available functions'),
  }),
  functionsDocs: z.array(
    z.object({
      name: z.string().describe('The name of the function being documented'),
      description: z.string().describe('A detailed description of what the function does and how it works'),
      docs: z.string().describe('Complete markdown documentation for the function including all parameters, return types, and examples'),
      examples: z.array(z.string()).describe('Code examples showing different parameter combinations and use cases'),
    })
  ).describe('Documentation for each function in the SDK. MUST include documentation for EVERY function available in the constructor.'),
  typesDocs: z.array(
    z.object({
      name: z.string().describe('The name of the type being documented'),
      description: z.string().describe('A detailed description of the type and its purpose'),
      docs: z.string().describe('Complete markdown documentation for the type including all fields, constraints, and examples'),
      examples: z.array(z.string()).describe('Example values showing how to use the type'),
    })
  ).describe('Documentation for all types used in the SDK. MUST include recursive expansion of all object and array types.'),
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
            'Detailed description explaining what this key is for and how to obtain it',
          ),
        required: z.boolean().describe('Whether this key is required'),
      }),
    )
    .optional()
    .describe(
      'List of required API keys needed for authentication with this SDK',
    ),
});

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
export async function generateDocs(
  code: string,
  metadata: SDKMetadata,
  packageDir: string,
  extraInfo: string[] = [],
): Promise<boolean> {
  try {
    // Update the system prompt to be more strict and detailed
    const docsSystemPrompt = dedent`
      You are a professional documentation generator for TypeScript SDKs. Your task is to create comprehensive, well-structured documentation that follows industry best practices.
      
      ## Process
      1. First carefully analyze the SDK code, schemas, types, and extra information
      2. Identify ALL functions in the SDK
      3. Create detailed documentation for each function
      4. Make sure the documentation is comprehensive and easy to understand
      5. Expand ALL types to their base types, continuing until reaching primitive types
      6. Document ALL possible values for each type
      
      ## Documentation Format
      Each function documentation should follow this structure:

      \`\`\`markdown
      ## Function: \`functionName\`

      [Clear, detailed description of what the function does and its purpose]

      **Purpose:**
      [Explain the main purpose and use cases of the function]

      **Parameters:**

      | Parameter | Type | Required | Description | Constraints | Example | Possible Values |
      |-----------|------|----------|-------------|-------------|---------|----------------|
      | param1 | type1 | Yes/No | Detailed description | Constraints | Example value | All possible values |
      | param2 | type2 | Yes/No | Detailed description | Constraints | Example value | All possible values |

      **Type Details:**

      [For each parameter and return type that is an object, array, or named type, expand it here. DO NOT refer to external type documentation.]

      ### ParameterTypeName
      [Description of the type]

      | Field | Type | Required | Description | Constraints | Example | Possible Values |
      |-------|------|----------|-------------|-------------|---------|----------------|
      | field1 | type1 | Yes/No | Description | Constraints | Example | All possible values |
      | field2 | type2 | Yes/No | Description | Constraints | Example | All possible values |

      [Continue expanding all nested types until reaching primitive types. DO NOT leave any type references unexpanded.]

      **Return Value:**

      [Detailed description of what the function returns]

      | Type | Description | Example | Possible Values |
      |------|-------------|---------|----------------|
      | ReturnType | Description | Example | All possible values |

      [If the return type is an object, array, or named type, expand it here. DO NOT refer to external type documentation.]

      ### ReturnTypeName
      [Description of the return type]

      | Field | Type | Required | Description | Constraints | Example | Possible Values |
      |-------|------|----------|-------------|-------------|---------|----------------|
      | field1 | type1 | Yes/No | Description | Constraints | Example | All possible values |
      | field2 | type2 | Yes/No | Description | Constraints | Example | All possible values |

      [Continue expanding all nested types until reaching primitive types. DO NOT leave any type references unexpanded.]

      **Examples:**

      [For functions with 2 or more parameters, generate at least 2 examples showing different parameter combinations. For functions with 1 parameter, generate 1 example.]

      \`\`\`typescript
      // Example 1: [Description of what this example demonstrates]
      const result = functionName({
        param1: 'value1',
        param2: 'value2'
      });

      // Example 2: [Description of what this example demonstrates]
      const result = functionName({
        param1: {
          nested1: 'value1',
          nested2: 'value2'
        },
        param2: ['value1', 'value2']
      });
      \`\`\`
      \`\`\`

      ## Type Documentation Standards
      1. Type Expansion Rules:
         - For each parameter and return type that is an object, array, or named type:
           * Create a new section in the function documentation
           * Document all fields with their types
           * For nested objects, create a new table
           * Continue expanding until reaching primitive types
           * Include field descriptions and constraints
           * Document required vs optional fields
           * Show default values if any
           * Document ALL possible values for each field
           * Include validation rules
           * Show example values
           * NEVER refer to external type documentation
           * ALWAYS expand all types inline

      2. Object Type Documentation:
         - Create a table for each object type
         - Document all fields with their types
         - For nested objects, create a new table
         - Continue expanding until reaching primitive types
         - Include field descriptions and constraints
         - Document required vs optional fields
         - Show default values if any
         - Document ALL possible values for each field
         - Include validation rules
         - Show example values
         - NEVER refer to external type documentation
         - ALWAYS expand all types inline

      3. Array Type Documentation:
         - Document the type of elements
         - For object arrays, create a table for the element type
         - Document array constraints (min/max length)
         - Show example arrays
         - For nested arrays, document the structure
         - Include validation rules for array contents
         - ALWAYS expand the element type if it's an object or named type
         - Document ALL possible values for array elements
         - NEVER refer to external type documentation
         - ALWAYS expand all types inline

      4. Recursive Type Expansion:
         - For each object field that is an object:
           * Create a new table for the nested object
           * Document all fields of the nested object
           * Continue expanding nested objects
           * Stop at primitive types
           * Document ALL possible values for each field
           * NEVER refer to external type documentation
         - For each array field that contains objects:
           * Create a table for the element type
           * Document all fields of the element type
           * Expand nested objects in elements
           * Stop at primitive types
           * Document ALL possible values for array elements
           * NEVER refer to external type documentation
         - For union types:
           * Document all possible types
           * For each object type in the union, create tables
           * Expand nested objects in each type
           * Document type guards if any
           * List ALL possible values for each type in the union
           * NEVER refer to external type documentation
         - For named types:
           * ALWAYS expand to their base types
           * Create tables for object types
           * Document all fields
           * Continue expanding until primitive types
           * Document ALL possible values for each field
           * NEVER refer to external type documentation

      5. Primitive Type Documentation:
         - For string types:
           * Document all possible string values
           * Include format requirements
           * Show validation patterns
           * List any enum values
         - For number types:
           * Document valid ranges
           * List any enum values
           * Show precision requirements
         - For boolean types:
           * Document when to use true/false
           * Explain the meaning of each value
         - For enum types:
           * List all possible enum values
           * Explain the meaning of each value
           * Show when to use each value

      ## Function Documentation Standards
      1. Function Overview:
         - Clear description of what the function does
         - Purpose and use cases
         - Any side effects or state changes
         - Error handling and edge cases
         - Performance considerations

      2. Parameter Documentation:
         - Document all parameters with types
         - Include required vs optional status
         - Document default values
         - Document possible values for enums
         - Expand object parameters to their base types
         - Document all nested object fields
         - Continue expanding until reaching primitive types
         - For array parameters, expand element types

      3. Return Value Documentation:
         - Describe what the function returns
         - Document the structure of returned data
         - Expand object return types to their base types
         - Document all nested object fields
         - Continue expanding until reaching primitive types
         - For array return types, expand element types

      4. Examples:
         - For functions with 2 or more parameters:
           * Generate at least 2 examples
           * Show different parameter combinations
           * Demonstrate different use cases
           * Include error handling if relevant
         - For functions with 1 parameter:
           * Generate 1 example
           * Show the parameter usage
           * Include error handling if relevant
         - NEVER include constructor or SDK initialization code
         - Examples should be practical and production-ready
         - Include comments explaining key points
         - Use mock data in examples
         - Focus only on the function being documented

      5. Constructor Documentation:
         - Show how to construct the SDK using environment variables
         - Show how to construct the SDK using configuration objects
         - Document all available configuration options
         - Include examples of different configuration combinations
         - Explain how to handle authentication
         - Show how to set up error handling
         
      ## Constructor Documentation Standards
      1. Constructor Overview:
         - Clear description of what the constructor does and its purpose
         - Purpose and use cases
         - Any side effects or state changes
         - Error handling and edge cases
         - Performance considerations

      2. Parameter Documentation:
         - Document all parameters with types
         - Include required vs optional status
         - Document default values
         - Document possible values for enums
         - Expand object parameters to their base types
         - Document all nested object fields
         - Continue expanding until reaching primitive types
         - For array parameters, expand element types

      3. Usage Documentation:
         - Show how to construct the SDK using environment variables
         - Show how to construct the SDK using configuration objects
         - Document all available configuration options
         - Include examples of different configuration combinations
         - Explain how to handle authentication
         - Show how to set up error handling
    `;

    // Update the generation prompt to be more strict
    const docsGenerationPrompt = dedent`
      You are requested to generate comprehensive documentation for a TypeScript SDK based on the following code and extra information.

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

      ## Documentation Requirements

      1. Type Documentation:
         For each type used in the SDK, generate comprehensive documentation that includes:
         - Complete type expansion until primitive types
         - ALL possible values for each field
         - Detailed descriptions and constraints
         - Validation rules and requirements
         - Examples showing valid values
         - For primitive types:
           * All possible string values
           * Valid number ranges
           * Boolean usage cases
           * All enum values
         - For object types:
           * All fields and their types
           * All possible values for each field
           * Nested object expansion
         - For array types:
           * Element type documentation
           * All possible element values
           * Array constraints
         - For union types:
           * All possible types
           * All possible values for each type
           * Type guards and validation
         - IMPORTANT: NEVER refer to external type documentation. ALWAYS expand all types inline.

      2. Function Documentation:
         For each function, generate documentation that includes:
         - Clear description of purpose and functionality
         - Detailed parameter documentation
         - Return value documentation
         - Practical examples WITHOUT constructor code
         - Error handling and edge cases
         - Expanded type documentation for all parameters and return values:
           * Create tables for all object types
           * Expand all nested objects and arrays
           * Document all fields and their types
           * Continue expanding until reaching primitive types
         - Examples based on parameter count:
           * For functions with 2+ parameters: at least 2 examples
           * For functions with 1 parameter: 1 example
           * Show different parameter combinations
           * Demonstrate different use cases
           * Include error handling if relevant
           * Use mock data in examples

      3. Constructor Documentation:
         Generate documentation that includes:
         - Clear description of purpose and functionality
         - Detailed parameter documentation
         - Expanded type documentation
         - Usage examples showing:
           * How to construct using environment variables
           * How to construct using configuration objects
           * Different configuration combinations
           * Authentication setup
           * Error handling setup

      4. Formatting Requirements:
         - Use markdown tables for types and parameters
         - Include code blocks for examples
         - Maintain consistent style
         - Use clear section headers
         - Include proper spacing
         - NEVER include constructor or SDK initialization code in function examples
         - Use mock data in examples
         - Follow the exact documentation format provided

      Generate documentation that is:
      - Comprehensive and detailed
      - Well-structured and easy to navigate
      - Practical with real-world examples
      - Technically accurate
      - Consistent in style and formatting
      - Follows TypeScript best practices
    `;

    // Generate documentation with Claude 3.5 Sonnet
    console.log('\n🧠 Generating detailed documentation...');
    const docsResult = await generateObject({
      model: models.googleGeminiPro,
      system: docsSystemPrompt,
      prompt: docsGenerationPrompt,
      schema: GenerateDocsSchema,
    });

    console.log('Usage:', docsResult.usage);

    try {
      // Validate the data against the schema
      const validatedData = GenerateDocsSchema.parse(docsResult.object);
      const constructorName = validatedData.constructorDocs.name;

      console.log(
        '📝 Generated detailed documentation with the following info:',
      );
      console.log(`- Constructor: ${constructorName}`);
      console.log(`- Functions: ${validatedData.functionsDocs.length}`);
      console.log(
        `- Environment Keys: ${validatedData.envKeys?.length || 0}`,
      );

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
        fs.writeFileSync(
          path.join(docsDir, `${func.name}.md`),
          func.docs || '',
        );
      }

      // Update package-info.json with constructor info
      const packageInfoPath = path.join(packageDir, 'package-info.json');
      const packageInfo = JSON.parse(
        fs.readFileSync(packageInfoPath, 'utf8'),
      );

      // Add readme_map
      packageInfo.readme_map = {
        title: metadata.title,
        description: `The full README for the ${metadata.title}`,
        path: 'https://github.com/microfox-ai/microfox/blob/main/packages/' + metadata.packageName.replace('@microfox/', '') + '/README.md',
        functionalities: validatedData.functionsDocs.map(f => f.name),
        all_readmes: [
          {
            path: 'https://github.com/microfox-ai/microfox/blob/main/packages/' + metadata.packageName.replace('@microfox/', '') + '/docs/' + constructorName + '.md',
            type: 'constructor',
            extension: 'md',
            functionality: constructorName,
            description: validatedData?.constructorDocs?.description || 'The full README for the ' + metadata.title + ' constructor',
          },
          ...validatedData.functionsDocs.map(f => ({
            path: 'https://github.com/microfox-ai/microfox/blob/main/packages/' + metadata.packageName.replace('@microfox/', '') + '/docs/' + f.name + '.md',
            type: 'functionality',
            extension: 'md',
            functionality: f.name,
            description: f.description || 'The full README for the ' + metadata.title + ' ' + f.name + ' functionality',
          })),
        ],
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
            ? validatedData.envKeys?.map(key => ({
              key: key.key,
              displayName: key.displayName,
              description: key.description,
            })) || []
            : [],
          internalKeys: packageInfo.authEndpoint
            ? validatedData.envKeys?.map(key => ({
              key: key.key,
              displayName: key.displayName,
              description: key.description,
            })) || []
            : [],
          functionalities: validatedData.functionsDocs.map(f => f.name),
        },
      ];

      // Add keysInfo
      packageInfo.keysInfo =
        validatedData.envKeys?.map(key => ({
          key: key.key,
          constructors: [constructorName],
          description: key.description,
          required: key.required,
        })) || [];

      // Add extraInfo
      packageInfo.extraInfo = extraInfo;

      // Install dependencies if provided
      if (
        validatedData.dependencies &&
        validatedData.dependencies.length > 0
      ) {
        console.log('📦 Installing dependencies...');
        const depsString = validatedData.dependencies.join(' ');

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
          for (const dep of validatedData.dependencies) {
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
      if (
        validatedData.devDependencies &&
        validatedData.devDependencies.length > 0
      ) {
        console.log('📦 Installing dev dependencies...');
        const devDepsString = validatedData.devDependencies.join(' ');

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
          for (const dep of validatedData.devDependencies) {
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
      if (
        validatedData.dependencies &&
        validatedData.dependencies.length > 0
      ) {
        packageInfo.dependencies = Array.from(
          new Set([
            'zod',
            ...validatedData.dependencies.map(d => d.split('@')[0]),
          ]),
        );
      }

      // Write updated package-info.json
      fs.writeFileSync(
        packageInfoPath,
        JSON.stringify(packageInfo, null, 2),
      );

      // Generate README.md
      const readmeContent = generateMainReadme(
        metadata,
        validatedData.constructorDocs,
        validatedData.functionsDocs,
        validatedData.envKeys || [],
        extraInfo,
      );
      fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent);

      console.log(`✅ Updated documentation files at ${packageDir}`);

      // Build the package
      await buildPackage(packageDir);

    } catch (error) {
      console.error('❌ Error generating documentation:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
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

  // Extract constructor name
  const constructorName = constructorDocs.name;

  // Create README content
  let content = `# ${title}\n\n${description}\n\n`;

  // Add installation section
  content += `## Installation\n\n\`\`\`bash\nnpm install ${packageName}\n\`\`\`\n\n`;

  // Add authentication section
  content += `## Authentication\n\n`;

  if (metadata.authType === 'oauth2') {
    content += `This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:\n\n`;
    content += `- \`accessToken\`: Your OAuth access token\n`;
    content += `- \`refreshToken\`: Your OAuth refresh token\n`;
    content += `- \`clientId\`: Your OAuth client ID\n`;
    content += `- \`clientSecret\`: Your OAuth client secret\n\n`;
    content += `You can obtain these credentials by following the OAuth 2.0 flow for ${metadata.apiName}.\n\n`;
  } else if (metadata.authType === 'apiKey') {
    content += `This SDK uses API key authentication. You need to provide the following credentials:\n\n`;

    for (const key of envKeys) {
      content += `- \`${key.key}\`: ${key.description}\n`;
    }

    content += `\nYou can obtain these credentials from the ${metadata.apiName} developer portal.\n\n`;
  } else {
    content += `This SDK does not require authentication.\n\n`;
  }

  // Add environment variables section
  if (envKeys.length > 0) {
    content += `## Environment Variables\n\n`;
    content += `The following environment variables are used by this SDK:\n\n`;

    for (const key of envKeys) {
      content += `- \`${key.key}\`: ${key.description} ${key.required ? '(Required)' : '(Optional)'}\n`;
    }

    content += `\n`;
  }

  // Add extra information section
  if (extraInfo.length > 0) {
    content += `## Additional Information\n\n`;

    for (const info of extraInfo) {
      content += `${info}\n\n`;
    }
  }

  content += '## API Reference\n\n';
  content += 'For detailed documentation on the constructor and all available functions, see:\n\n';
  content += `- [${constructorName}](./docs/${constructorName}.md)\n`;
  for (const func of functionsDocs) {
    content += `- [${func.name}](./docs/${func.name}.md)\n`;
  }

  return content;
}

if (require.main === module) {
  const packageDir = path.join(__dirname, '../../packages/instagram');
  const sdkCode = fs.readFileSync(
    path.join(packageDir, 'src/instagramSdk.ts'),
    'utf8',
  );
  // const schemaCode = fs.readFileSync(
  //   path.join(packageDir, 'src/schemas/index.ts'),
  //   'utf8',
  // ) || '';
  // const typesCode = fs.readFileSync(
  //   path.join(packageDir, 'src/types/index.ts'),
  //   'utf8',
  // ) || '';
  const exportsCode = fs.readFileSync(
    path.join(packageDir, 'src/index.ts'),
    'utf8',
  ) || '';
  const packageInfo = JSON.parse(fs.readFileSync(
    path.join(packageDir, 'package-info.json'),
    'utf8',
  ));
  // // Types (src/types/index.ts)
  // ${typesCode}\n\n
  // // Schemas (src/schemas/index.ts)
  // ${schemaCode}\n\n
  const combinedCode = `
  // Main SDK (src/[packageName]Sdk.ts)
  ${sdkCode}\n\n
  // Exports (src/index.ts)
  ${exportsCode}
  `;
  const metadata = {
    apiName: packageInfo.name,
    packageName: packageInfo.name,
    title: packageInfo.title,
    description: packageInfo.description,
    authType: packageInfo.constructor[0]?.auth || 'none',
    ...(packageInfo.constructor[0]?.auth === 'oauth2' && packageInfo.constructor[0]?.authSdk && {
      authSdk: packageInfo.constructor[0]?.authSdk,
    }),
  };
  const extraInfo = packageInfo.extraInfo || [];

  generateDocs(combinedCode, metadata, packageDir, extraInfo);
}
