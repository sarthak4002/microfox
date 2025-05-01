# Brave TypeScript SDK

TypeScript SDK for the Brave search API, providing functions for web search, summarizer search, image search, video search, news search, suggestions, and spellcheck.

## Installation

```bash
npm install @microfox/brave
```

## Environment Variables

The following environment variables are used by this SDK:

- `BRAVE_API_KEY`: Your Brave Search API key.  You can obtain this key from the Brave Search API developer portal. (Required)

## Additional Information

Use the `createBraveSDK` constructor to create a new client.

## API Reference

For detailed documentation on the constructor and all available functions, see:

- [createBraveSDK](./docs/createBraveSDK.md)
- [webSearch](./docs/webSearch.md)
- [imageSearch](./docs/imageSearch.md)
- [videoSearch](./docs/videoSearch.md)
- [newsSearch](./docs/newsSearch.md)
- [getSuggestions](./docs/getSuggestions.md)
- [spellcheck](./docs/spellcheck.md)
- [summarizerSearch](./docs/summarizerSearch.md)
