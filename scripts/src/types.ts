import { z } from 'zod';

export const ReadMeObject = z.object({
  path: z
    .string()
    .describe(
      'The path to the README file in the package or outside the package',
    ),
  type: z
    .enum(['main', 'functionality'])
    .describe('The type of the README file'),
  extension: z
    .enum(['md', 'txt', 'html'])
    .describe('The extension of the README file'),
  functionality: z
    .string()
    .optional()
    .describe('The functionality this README file explains on how to use'),
});

export const PackageReadmeMap = z.object({
  path: z.string().describe('The path to the main README file in the package'),
  functionalities: z
    .array(z.string())
    .describe('The functionalities of the package'),
  all_readmes: z
    .array(ReadMeObject)
    .describe('The main readmes of the package'),
  description: z.string().describe('The description of the package'),
});

export const KeyInfo = z.object({
  key: z.string().describe('The key of the constructor'),
  displayName: z.string().describe('The display name of the key'),
  description: z.string().describe('The description of the key'),
  defaultValue: z.string().optional().describe('The default value of the key'),
});

export const Constructor = z.object({
  name: z.string().describe('The name of the constructor'),
  description: z.string().describe('The description of the constructor'),
  auth: z
    .enum(['oauth2', 'apikey'])
    .describe('The authentication method of the constructor'),
  authEndpoint: z
    .string()
    .optional()
    .describe('The endpoint of the constructor'),
  requiredKeys: z
    .array(KeyInfo)
    .describe('The required keys of the constructor'),
  internalKeys: z
    .array(KeyInfo)
    .describe('The internal keys of the constructor'),
  functionalities: z
    .array(z.string())
    .describe('The functionalities of the constructor'),
  apiType: z
    .enum(['bot_token', 'api_key'])
    .optional()
    .describe('The type of the API'),
});

export const PackageInfo = z.object({
  name: z
    .string()
    .describe('The name of the package - @slack/web-api or @microfox/slack'),
  title: z.string().describe('Display name of the package'),
  description: z.string().describe('One line Description of the package'),
  path: z
    .string()
    .describe(
      'The path to the package in the monorepo - packages/ext_@slack#web-api or packages/@microfox/slack',
    ),
  dependencies: z.array(z.string()).describe('The dependencies of the package'),
  status: z
    .enum(['stable', 'semiStable', 'unstable'])
    .describe('The status of the package'),
  documentation: z.string().describe('The documentation of the package'),
  icon: z.string().describe('The icon url of the package'),
  readme_map: PackageReadmeMap,
  constructors: z.array(Constructor),
  keysInfo: z.array(
    KeyInfo.extend({
      constructors: z.array(z.string()),
      required: z.boolean().optional(),
    }),
  ),
  extraInfo: z.array(z.string()),
});
