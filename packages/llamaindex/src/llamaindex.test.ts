import { EchoAITool } from '@microfox/core';
import { describe, expect, test } from 'vitest';

import { createLlamaIndexTools } from './llamaindex';

describe('llamaindex', () => {
  test('createLlamaIndexTools', () => {
    expect(createLlamaIndexTools(new EchoAITool())).toHaveLength(1);
  });
});
