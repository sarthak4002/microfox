import { type AIFunctionLike, AIFunctionSet } from '@microfox/core';
import { createTool } from '@mastra/core';

// Define a type for the tool object
type MastraTool = ReturnType<typeof createTool>;
type MastraTools = Record<string, MastraTool>;

/**
 * Converts a set of Microfox stdlib AI functions to an object compatible with
 * the Mastra Agent `tools` format.
 */
export function createMastraTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): MastraTools {
  const fns = new AIFunctionSet(aiFunctionLikeTools);

  return Object.fromEntries(
    fns.map(fn => [
      fn.spec.name,
      createTool({
        id: fn.spec.name,
        description: fn.spec.description,
        inputSchema: fn.inputSchema,
        execute: (ctx: { context: any }) => fn.impl(ctx.context),
      }),
    ]),
  );
}
