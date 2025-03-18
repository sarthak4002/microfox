import { describe, it, expect, beforeAll } from 'vitest';
import { createXSDK } from '@microfox/x-sdk';

// Check if required environment variables are available
const hasRequiredEnvVars =
  process.env.X_API_KEY &&
  process.env.X_API_SECRET &&
  process.env.X_ACCESS_TOKEN &&
  process.env.X_ACCESS_SECRET;

// Create conditional test runner - only run tests if environment variables are available
const itIfEnvVars = hasRequiredEnvVars ? it : it.skip;

describe('X SDK Integration Tests', () => {
  let xSDK: ReturnType<typeof createXSDK>;

  beforeAll(() => {
    if (!hasRequiredEnvVars) {
      console.warn(
        'Skipping X SDK integration tests. Required environment variables not set.\n' +
          'Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_SECRET to run these tests.',
      );
    } else {
      console.log('Running X SDK integration tests with provided credentials');
      // Initialize SDK with real credentials
      xSDK = createXSDK({
        apiKey: process.env.X_API_KEY as string,
        apiSecret: process.env.X_API_SECRET as string,
        accessToken: process.env.X_ACCESS_TOKEN as string,
        accessSecret: process.env.X_ACCESS_SECRET as string,
      });
    }
  });

  describe('User Operations', () => {
    itIfEnvVars('should get a user by username', async () => {
      // Using a known public account
      const response = await xSDK.users.getByUsername('elonmusk');

      expect(response.data).toBeDefined();
      expect(response.data?.username).toBe('elonmusk');
      expect(response.data?.id).toBeDefined();
    });

    itIfEnvVars('should get the authenticated user', async () => {
      const response = await xSDK.users.getMe();

      expect(response.data).toBeDefined();
      expect(response.data?.id).toBeDefined();
      expect(response.data?.username).toBeDefined();
    });

    itIfEnvVars('should get multiple users by usernames', async () => {
      const response = await xSDK.users.getByUsernames(['elonmusk', 'SpaceX']);

      expect(response.data).toBeDefined();
      expect(response.data?.length).toBeGreaterThanOrEqual(1);

      // Check if at least one of the requested users is returned
      const usernames = response.data?.map(user => user.username);
      expect(usernames).toContain('elonmusk');
    });
  });

  describe('Tweet Operations', () => {
    let createdTweetId: string | undefined;

    itIfEnvVars('should create a tweet', async () => {
      const uniqueText = `Test tweet from automated tests at ${new Date().toISOString()}`;
      const response = await xSDK.tweets.create({
        text: uniqueText,
        for_super_followers_only: false,
        nullcast: false,
      });

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.text).toBe(uniqueText);

      // Save the ID for later tests
      createdTweetId = response.id;
    });

    itIfEnvVars('should get a tweet by ID', async () => {
      // Skip if we don't have a tweet ID from the previous test
      if (!createdTweetId) {
        console.warn('Skipping tweet lookup test - no tweet was created');
        return;
      }

      const response = await xSDK.tweets.get(createdTweetId);

      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(createdTweetId);
    });

    itIfEnvVars('should delete a tweet', async () => {
      // Skip if we don't have a tweet ID from the previous test
      if (!createdTweetId) {
        console.warn('Skipping tweet deletion test - no tweet was created');
        return;
      }

      const response = await xSDK.tweets.delete(createdTweetId);

      expect(response.data).toBeDefined();
      expect(response.data?.deleted).toBe(true);

      // Clear the ID after deletion
      createdTweetId = undefined;
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent user errors', async () => {
      // Skip if no credentials
      if (!hasRequiredEnvVars) {
        return;
      }

      try {
        await xSDK.users.getByUsername('thisuserprobablydoesnotexist12345678');
        // If we get here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Failed to get user by username');
      }
    });

    it('should handle invalid tweet ID errors', async () => {
      // Skip if no credentials
      if (!hasRequiredEnvVars) {
        return;
      }

      try {
        // Using a completely invalid ID format
        await xSDK.tweets.get('invalid-id-12345');
        // If we get here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Failed to get tweet');
      }
    });
  });
});
