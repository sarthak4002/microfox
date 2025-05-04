export interface TokenCostConfig {
  inputTokenCost: number;
  outputTokenCost: number;
}

export const tokenCosts: Record<string, TokenCostConfig> = {
  'claude-3-haiku-20240307': {
    inputTokenCost: 0.25 / 1_000_000, // $0.25 per million tokens
    outputTokenCost: 1.25 / 1_000_000, // $1.25 per million tokens
  },
  'claude-3-5-sonnet-20240620': {
    inputTokenCost: 3.0 / 1_000_000, // $3.00 per million tokens
    outputTokenCost: 15.0 / 1_000_000, // $15.00 per million tokens
  },
  'gemini-1.5-flash': {
    inputTokenCost: 0.5 / 1_000_000, // $0.50 per million tokens
    outputTokenCost: 1.5 / 1_000_000, // $1.50 per million tokens
  },
  'gemini-1.5-pro': {
    inputTokenCost: 1.0 / 1_000_000, // $1.00 per million tokens
    outputTokenCost: 2.0 / 1_000_000, // $2.00 per million tokens
  },
};
