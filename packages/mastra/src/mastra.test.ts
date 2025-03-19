import { EchoAITool } from '@microfox/core';
import { describe, expect, test } from 'vitest';

import { createMastraTools } from './mastra';

describe('mastra', () => {
  test('createMastraTools', () => {
    expect(createMastraTools(new EchoAITool())).toHaveProperty('echo');
  });
});
