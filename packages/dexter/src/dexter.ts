import { type AIFunctionLike, AIFunctionSet } from '@microfox/core';
import { createAIFunction } from '@dexaai/dexter';

/**
 * Converts a set of Microfox stdlib AI functions to an array of Dexter-
 * compatible AI functions.
 */
export function createDexterFunctions(
  ...aiFunctionLikeTools: AIFunctionLike[]
) {
  const fns = new AIFunctionSet(aiFunctionLikeTools);

  return fns.map(fn =>
    createAIFunction(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        argsSchema: fn.inputSchema,
      },
      fn.impl,
    ),
  );
}
