# REST SDK Example

This example demonstrates how to use the `@microfox/rest-sdk` package with various APIs.

## Features

- Integration with JSONPlaceholder API
- GitHub API integration example
- OpenWeather API example
- Error handling demonstrations
- Type-safe API interactions

## Getting Started

1. Clone the repository and navigate to the example directory:

```bash
git clone https://github.com/microfox-ai/microfox.git
cd microfox/examples/rest-sdk-example
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your API keys:

```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run the examples:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

## Example Usage

```typescript
import { RestSDK } from '@microfox/rest-sdk';
import { z } from 'zod';

// GitHub API Example
const githubAPI = new RestSDK({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

// Define response schema
const RepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  // ... other fields
});

// Search repositories
const searchResults = await githubAPI.get('/search/repositories', {
  params: { q: 'typescript' },
  responseSchema: z.object({
    items: z.array(RepoSchema),
  }),
});
```

## Available Examples

- `src/index.ts` - Main example file with various API integrations
- `src/__tests__/rest-sdk.test.ts` - Test examples showing different use cases

## Contributing

Feel free to submit issues and enhancement requests!
