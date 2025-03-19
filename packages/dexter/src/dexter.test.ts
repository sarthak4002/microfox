import { EchoAITool } from '@microfox/core';
import { describe, expect, test } from 'vitest';

import { createDexterFunctions } from './dexter';

describe('dexter', () => {
  test('createDexterFunctions', () => {
    expect(createDexterFunctions(new EchoAITool())).toHaveLength(1);
  });
});
