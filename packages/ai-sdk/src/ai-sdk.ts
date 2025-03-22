import { type AIFunctionLike, AIFunctionSet } from '@microfox/core';
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Schema for AI SDK Tool configuration
 */
export const aiToolConfigSchema = z.object({
  description: z.string().describe('Description of the tool functionality'),
  parameters: z.any().describe('Schema defining the parameters for the tool'),
  execute: z.function().describe('Function that implements the tool logic'),
});

export type AIToolConfig = z.infer<typeof aiToolConfigSchema>;

/**
 * Schema for AI SDK Tool output
 */
export const aiToolOutputSchema = z
  .record(z.any())
  .describe('Collection of AI tools for use with the Vercel AI SDK');

export type AIToolOutput = z.infer<typeof aiToolOutputSchema>;

/**
 * Converts a set of Microfox stdlib AI functions to an object compatible with
 * the Vercel AI SDK's `tools` parameter.
 */
export function createAISDKTools(...aiFunctionLikeTools: AIFunctionLike[]) {
  const fns = new AIFunctionSet(aiFunctionLikeTools);

  return Object.fromEntries(
    fns.map(fn => [
      fn.spec.name,
      tool({
        description: fn.spec.description,
        parameters: fn.inputSchema as z.ZodTypeAny,
        execute: fn.impl,
      }),
    ]),
  );
}
