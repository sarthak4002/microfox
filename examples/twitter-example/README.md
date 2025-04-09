# X SDK Examples

This directory contains example code demonstrating how to use the `@microfox/twitter` package.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this directory with your X API credentials:

```env
X_API_KEY=your-api-key
X_API_SECRET=your-api-secret
X_ACCESS_TOKEN=your-access-token
X_ACCESS_SECRET=your-access-secret
```

3. Make sure your X API credentials have the necessary permissions for the endpoints you want to use.

## Running Tests

The tests use environment variables for authentication. Make sure your `.env` file is properly configured.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Note: Tests will automatically skip if required environment variables are not set.

## Example Usage

### Creating a Tweet

```typescript
import { createXSDK } from '@microfox/twitter';
import dotenv from 'dotenv';

dotenv.config();

const sdk = createXSDK({
  apiKey: process.env.X_API_KEY!,
  apiSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

async function main() {
  try {
    // Create a simple tweet
    const tweet = await sdk.tweets.create({
      text: 'Hello from X SDK!',
    });
    console.log('Tweet created:', tweet);

    // Get the tweet we just created
    const fetchedTweet = await sdk.tweets.get(tweet.id);
    console.log('Fetched tweet:', fetchedTweet);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Uploading Media

```typescript
import { createXSDK } from '@microfox/twitter';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const sdk = createXSDK({
  apiKey: process.env.X_API_KEY!,
  apiSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

async function main() {
  try {
    // Upload an image
    const imageBuffer = readFileSync('path/to/image.jpg');
    const mediaResponse = await sdk.media.upload(imageBuffer, 'image/jpeg');

    // Create a tweet with the uploaded image
    const tweet = await sdk.tweets.create({
      text: 'Check out this image!',
      media: {
        media_ids: [mediaResponse.media_id_string],
      },
    });

    console.log('Tweet with media created:', tweet);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### User Operations

```typescript
import { createXSDK } from '@microfox/twitter';
import dotenv from 'dotenv';

dotenv.config();

const sdk = createXSDK({
  apiKey: process.env.X_API_KEY!,
  apiSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

async function main() {
  try {
    // Get authenticated user's info
    const me = await sdk.users.getMe();
    console.log('My user info:', me);

    // Get user by username
    const user = await sdk.users.getByUsername('twitter');
    console.log('User info:', user);

    // Get multiple users
    const users = await sdk.users.getByUsernames(['twitter', 'x']);
    console.log('Multiple users:', users);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Error Handling

```typescript
import { createXSDK, XError } from '@microfox/twitter';
import dotenv from 'dotenv';

dotenv.config();

const sdk = createXSDK({
  apiKey: process.env.X_API_KEY!,
  apiSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

async function main() {
  try {
    // Try to get a non-existent tweet
    const tweet = await sdk.tweets.get('non-existent-id');
  } catch (error) {
    if (error instanceof XError) {
      console.error('API Error:', error.message);
      if (error.errors) {
        console.error('Error details:', error.errors);
      }
      if (error.status) {
        console.error('HTTP Status:', error.status);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

main();
```
