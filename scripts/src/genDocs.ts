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
  }),
  functionsDocs: z
    .array(
      z.object({
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
      }),
    )
    .describe(
      'Documentation for each function in the SDK. MUST include documentation for EVERY function available in the constructor.',
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
    // Update the system prompt to be more focused on textual documentation
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
      [Describe each parameter in detail, including:
      - Parameter name and type (for arrays, specify element type like array<string>, array<number>, array<object>, etc.)
      - Whether it's required or optional
      - Detailed description of what the parameter represents
      - Any constraints or valid values
      - Default values if applicable
      - For each parameter type that is an object, array, or named type, provide a detailed description of its structure and purpose]

      **Return Value:**
      [Describe what the function returns, including:
      - Return type (for arrays, specify element type like array<string>, array<number>, array<object>, etc.)
      - Description of the returned value
      - Any special cases or conditions
      - Error cases if applicable
      - For return types that are objects, arrays, or named types, provide a detailed description of their structure]

      **Examples:**
      [Provide examples that demonstrate all possible functionality of the function. Include examples for:
      - Minimal usage with only required arguments
      - Full usage with all optional arguments
      - Different input types and formats
      - Edge cases and special conditions
      - Error handling scenarios
      - Return value variations]

      \`\`\`typescript
      // Example 1: Minimal usage with only required arguments
      const result1 = functionName({
        // Required string parameter - should be a valid identifier
        param1: '<identifier>',
        // Required array<string> parameter - list of valid identifiers
        param2: ['<identifier1>', '<identifier2>']
      });

      // Example 2: Full usage with all optional arguments
      const result2 = functionName({
        // Required string parameter - should be a valid identifier
        param1: '<identifier>',
        // Required array<string> parameter - list of valid identifiers
        param2: ['<identifier1>', '<identifier2>'],
        // Optional number parameter - controls behavior (default: 0)
        optionalParam1: 42,
        // Optional array<object> parameter - additional configuration
        optionalParam2: [
          { id: '<id1>', value: 1 },
          { id: '<id2>', value: 2 }
        ],
        // Optional boolean parameter - enables feature (default: false)
        optionalParam3: true
      });

      // Example 3: Different input types with optional arguments
      const result3 = functionName({
        // Required string parameter - should be a valid identifier
        param1: '<identifier>',
        // Required array<string> parameter - list of valid identifiers
        param2: ['<identifier1>', '<identifier2>'],
        // Optional array<number> parameter - list of quantities
        optionalParam1: [42, 100],
        // Optional array<boolean> parameter - list of feature flags
        optionalParam2: [true, false, true]
      });

      // Example 4: Error handling with optional arguments
      try {
        const result4 = functionName({
          // Required string parameter - should be a valid identifier
          param1: '<identifier>',
          // Required array<string> parameter - list of valid identifiers
          param2: ['<identifier1>', '<identifier2>'],
          // Invalid optional number parameter - will trigger validation error
          optionalParam1: -1
        });
      } catch (error) {
        // Handle validation error
        console.error('Invalid optional parameter:', error.message);
      }

      // Example 5: Using different combinations of optional arguments
      const result5 = functionName({
        // Required string parameter - should be a valid identifier
        param1: '<identifier>',
        // Required array<string> parameter - list of valid identifiers
        param2: ['<identifier1>', '<identifier2>'],
        // Using only some optional parameters
        optionalParam1: 42,
        optionalParam3: true
      });
      \`\`\`
      \`\`\`

      ## Type Documentation Standards
      1. Type Expansion Rules:
         - For each parameter and return type that is an object, array, or named type:
           * Document all fields with their types
           * For nested objects, create a new section
           * Continue expanding until reaching primitive types
           * Include field descriptions and constraints
           * Document required vs optional fields
           * Show default values if any
           * Document ALL possible values for each field
           * Include validation rules
           * NEVER refer to external type documentation
           * ALWAYS expand all types inline

      2. Object Type Documentation:
         - Create a section for each object type
         - Document all fields with their types
         - For nested objects, create a new section
         - Continue expanding until reaching primitive types
         - Include field descriptions and constraints
         - Document required vs optional fields
         - Show default values if any
         - Document ALL possible values for each field
         - Include validation rules
         - NEVER refer to external type documentation
         - ALWAYS expand all types inline

      3. Array Type Documentation:
         - Document the element type (e.g., array<string>, array<number>, array<object>)
         - For object arrays, create a section for the element type
         - Document array constraints (min/max length)
         - For nested arrays, document the structure (e.g., array<array<string>>)
         - Include validation rules for array contents
         - ALWAYS expand the element type if it's an object or named type
         - Document ALL possible values for array elements
         - NEVER refer to external type documentation
         - ALWAYS expand all types inline

      4. Recursive Type Expansion:
         - For each object field that is an object:
           * Create a new section for the nested object
           * Document all fields of the nested object
           * Continue expanding nested objects
           * Stop at primitive types
           * Document ALL possible values for each field
           * NEVER refer to external type documentation
         - For each array field that contains objects:
           * Create a section for the element type (e.g., array<object>)
           * Document all fields of the element type
           * Expand nested objects in elements
           * Stop at primitive types
           * Document ALL possible values for array elements
           * NEVER refer to external type documentation
         - For union types:
           * Document all possible types
           * For each object type in the union, create sections
           * Expand nested objects in each type
           * Document type guards if any
           * List ALL possible values for each type in the union
           * NEVER refer to external type documentation
         - For named types:
           * ALWAYS expand to their base types
           * Create sections for object types
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
         - Provide minimal example with only required arguments
         - Provide full example with all optional arguments
         - Show different combinations of optional arguments
         - Include examples for all parameter combinations
         - Show different input types and formats
         - Demonstrate edge cases and special conditions
         - Include error handling scenarios
         - Show variations in return values
         - Use clear and descriptive comments
         - Use descriptive placeholder values that explain the expected format/type
         - Focus on demonstrating functionality rather than real-world use cases

      5. Constructor Documentation:
         - Show how to construct the SDK using configuration objects (use environment variables if suitable instead of mock data)
         - Document all available configuration options
         - Include examples of different configuration combinations
         - Explain how to handle authentication
         - Show how to set up error handling
    `;

    // Update the generation prompt to be more focused on textual documentation
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
         - Examples showing valid values (if helpful)
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
           * Create sections for all object types
           * Expand all nested objects and arrays
           * Document all fields and their types
           * Continue expanding until reaching primitive types
         - Examples based on need:
           * Provide examples only when they add value
           * Show different parameter combinations if helpful
           * Demonstrate different use cases
           * Include error handling if relevant
           * Use mock data in examples
         - IMPORTANT: 
           * NEVER leave placeholders like [Implementation Details], [Parameter Details], etc.
           * NEVER cross-reference other documentation files
           * Each function's documentation must be complete and self-contained
           * If the function is not documented, it should be removed from the package

      3. Constructor Documentation:
         Generate documentation that includes:
         - Clear description of purpose and functionality
         - Detailed parameter documentation
         - Expanded type documentation
         - Usage examples showing:
           * How to construct using configuration objects (use environment variables if suitable instead of mock data)
           * Different configuration combinations
           * Authentication setup
           * Error handling setup
         - IMPORTANT:
           * NEVER leave placeholders like [Implementation Details], [Parameter Details], etc.
           * NEVER cross-reference other documentation files
           * Constructor documentation must be complete and self-contained

      4. Environment Variables:
         Generate environment variables documentation that includes:
         - All required API keys and tokens
         - For OAuth2 authentication:
           * Include the constructor configs like accessToken, refreshToken, clientId, clientSecret, etc. in the environment variables
           * If the constructor config includes scopes, ALWAYS include a SCOPES environment variable
           * The name of the environment variable should be based on the oauth provider name not the package name. For example, for google-oauth, the environment variable should be GOOGLE_ACCESS_TOKEN, GOOGLE_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SCOPES etc. not GOOGLE_SHEETS_ACCESS_TOKEN, GOOGLE_SHEETS_REFRESH_TOKEN, GOOGLE_SHEETS_CLIENT_ID, GOOGLE_SHEETS_CLIENT_SECRET, GOOGLE_SHEETS_SCOPES etc.
         - For each environment variable:
           * Clear display name
           * Detailed description
           * Required/optional status
           * Format and validation requirements

      5. Formatting Requirements:
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
      - COMPLETE with no placeholders or cross-references
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
        fs.writeFileSync(path.join(docsDir, `${func.name}.md`), func.docs);
      }

      // Update package-info.json with constructor info
      const packageInfoPath = path.join(packageDir, 'package-info.json');
      const packageInfo = JSON.parse(fs.readFileSync(packageInfoPath, 'utf8'));

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
          ...validatedData.functionsDocs.map(f => ({
            path:
              'https://github.com/microfox-ai/microfox/blob/main/packages/' +
              metadata.packageName.replace('@microfox/', '') +
              '/docs/' +
              f.name +
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
          ...(metadata.authType === 'oauth2' && {
            authEndpoint: packageInfo.authEndpoint,
          }),
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
      const depsString = validatedData.dependencies?.join(' ') || '';
      const devDepsString =
        validatedData.devDependencies?.join(' --save-dev') || '';

      try {
        const originalDir = process.cwd();
        process.chdir(packageDir);
        if (depsString) {
          console.log('📦 Installing dependencies...', depsString);
          await execAsync(`npm i ${depsString}`);
        }
        if (devDepsString) {
          console.log('📦 Installing dev dependencies...', devDepsString);
          await execAsync(`npm i ${devDepsString}`);
        }

        // Return to original directory
        process.chdir(originalDir);

        console.log(`✅ Installed dependencies: ${depsString}`);
      } catch (error) {
        console.error(`❌ Failed to install dependencies: ${error}`);
      }

      // Update package.json with dependencies
      const packageJsonPath = path.join(packageDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      packageInfo.dependencies = Object.keys(packageJson?.dependencies || {});

      // Write updated package-info.json
      fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));

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

  // // Add authentication section
  // content += `## Authentication\n\n`;

  // if (metadata.authType === 'oauth2') {
  //   content += `This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:\n\n`;
  //   content += `- \`accessToken\`: Your OAuth access token\n`;
  //   content += `- \`refreshToken\`: Your OAuth refresh token\n`;
  //   content += `- \`clientId\`: Your OAuth client ID\n`;
  //   content += `- \`clientSecret\`: Your OAuth client secret\n\n`;
  //   content += `You can obtain these credentials by following the OAuth 2.0 flow for ${metadata.apiName}.\n\n`;
  // } else if (metadata.authType === 'apikey') {
  //   content += `This SDK uses API key authentication. You need to provide the following credentials:\n\n`;

  //   for (const key of envKeys) {
  //     content += `- \`${key.key}\`: ${key.description}\n`;
  //   }

  //   content += `\nYou can obtain these credentials from the ${metadata.apiName} developer portal.\n\n`;
  // } else {
  //   content += `This SDK does not require authentication.\n\n`;
  // }

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
  content +=
    'For detailed documentation on the constructor and all available functions, see:\n\n';
  content += `- [${constructorName}](./docs/${constructorName}.md)\n`;
  for (const func of functionsDocs) {
    content += `- [${func.name}](./docs/${func.name}.md)\n`;
  }

  return content;
}

if (require.main === module) {
  // Get package name from command line argument
  const packageName = process.argv[2];
  if (!packageName) {
    console.error('Please provide a package name as an argument');
    process.exit(1);
  }

  const packageDir = path.join(__dirname, '../../packages', packageName);

  // Check if package directory exists
  if (!fs.existsSync(packageDir)) {
    console.error(`Package directory not found: ${packageDir}`);
    process.exit(1);
  }

  // Find all TypeScript files in src directory
  const srcDir = path.join(packageDir, 'src');
  const tsFiles = fs
    .readdirSync(srcDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join('src', file));

  // Read and combine all TypeScript files
  let combinedCode = '';
  for (const file of tsFiles) {
    const filePath = path.join(packageDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    combinedCode += `\n// ${file}\n${fileContent}\n`;
  }

  const packageInfo = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package-info.json'), 'utf8'),
  );

  const metadata = {
    apiName: packageInfo.name,
    packageName: packageInfo.name,
    title: packageInfo.title,
    description: packageInfo.description,
    authType: packageInfo.constructors[0]?.auth || 'none',
    ...(packageInfo.constructors[0]?.auth === 'oauth2' &&
      packageInfo.constructors[0]?.authSdk && {
        authSdk: packageInfo.constructors[0]?.authSdk,
      }),
  };

  const extraInfo = packageInfo.extraInfo || [];
  generateDocs(combinedCode, metadata, packageDir, extraInfo);
}
