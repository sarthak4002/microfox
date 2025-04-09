# @microfox/linkedin-share

A robust TypeScript SDK for sharing content on LinkedIn with built-in Zod validation.

## Features

- 📘 Full TypeScript support with type definitions
- 🛡️ Runtime validation with Zod schemas
- 📱 Rich content sharing capabilities:
  - Text posts
  - Articles
  - Images
  - Videos
  - Documents
- 🔒 Multiple visibility options (Public, Connections, Logged-in)
- ⚠️ Comprehensive error handling with descriptive messages
- 🎯 Simple, intuitive API

## Installation

```bash
npm install @microfox/linkedin-share
# or
yarn add @microfox/linkedin-share
# or
pnpm add @microfox/linkedin-share
```

## Usage

### Basic Setup

```typescript
import { LinkedinShareSdk } from '@microfox/linkedin-share';

const share = new LinkedinShareSdk('your_access_token');
```

### Share Content

#### Simple Text Post

```typescript
await share.post({
  text: 'Hello LinkedIn!',
  visibility: 'PUBLIC', // Default visibility
});
```

#### Share an Article

```typescript
await share.post({
  text: 'Check out this article!',
  mediaCategory: 'ARTICLE',
  media: [
    {
      url: 'https://example.com/article',
      title: 'Amazing Article',
      description: 'Must-read content',
    },
  ],
});
```

#### Share an Image

```typescript
await share.post({
  text: 'Check out this image!',
  mediaCategory: 'IMAGE',
  media: [
    {
      url: 'https://example.com/image.jpg',
      title: 'My Image',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    },
  ],
});
```

#### Share with Custom Visibility

```typescript
await share.post({
  text: 'For my connections only',
  visibility: 'CONNECTIONS',
});
```

#### Create a Draft Post

```typescript
await share.post({
  text: 'Draft post',
  isDraft: true,
});
```

## Validation and Error Handling

The SDK uses Zod for comprehensive validation at multiple levels:

1. Input Validation: All post options are validated before processing
2. Content Validation: The constructed share content is validated before sending to LinkedIn
3. Response Validation: LinkedIn's response is validated to ensure correct format

### Handling Validation Errors

```typescript
import { z } from 'zod';
import { LinkedinShareSdk } from '@microfox/linkedin-share';

const share = new LinkedinShareSdk('your_access_token');

try {
  await share.post({
    text: 'Hello LinkedIn!',
    mediaCategory: 'INVALID_CATEGORY', // This will trigger a validation error
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error('Validation failed:', error.errors);
    // error.errors will contain detailed information about what went wrong
    // [{
    //   code: 'invalid_enum_value',
    //   path: ['mediaCategory'],
    //   message: "Invalid enum value. Expected 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'"
    // }]
  } else {
    // Handle other errors (network, LinkedIn API, etc.)
    console.error('Share failed:', error.message);
  }
}
```

### Available Schemas

The SDK exports its Zod schemas if you need to validate data before calling the API:

```typescript
import {
  postOptionsSchema,
  mediaContentSchema,
  mediaCategorySchema,
  visibilitySchema,
} from '@microfox/linkedin-share';

// Validate post options
const validOptions = postOptionsSchema.parse({
  text: 'Hello',
  mediaCategory: 'IMAGE',
});

// Validate media content
const validMedia = mediaContentSchema.parse({
  url: 'https://example.com/image.jpg',
  title: 'My Image',
});
```

## Types

```typescript
import type {
  LinkedInPostOptions,
  LinkedInShareContent,
  LinkedInShareResponse,
  LinkedInMediaContent,
  LinkedInVisibility,
  MediaCategory,
} from '@microfox/linkedin-share';
```

### Media Categories

```typescript
type MediaCategory = 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
```

### Visibility Options

```typescript
type LinkedInVisibility = 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
```

### Post Options

```typescript
interface LinkedInPostOptions {
  text: string;
  visibility?: LinkedInVisibility;
  mediaCategory?: MediaCategory;
  media?: LinkedInMediaContent[];
  isDraft?: boolean;
}
```

### Media Content

```typescript
interface LinkedInMediaContent {
  url?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}
```

## License

MIT
