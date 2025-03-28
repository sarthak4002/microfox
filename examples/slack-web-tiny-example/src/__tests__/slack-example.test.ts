import { describe, it, expect, beforeAll } from 'vitest';
import { createSlackSDK } from '@microfox/slack-web-tiny';

// Get channel ID from environment variables
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID ?? '';
const INVALID_CHANNEL = 'INVALID';
const INVALID_TOKEN = 'xoxb-invalid-token';
const MOCK_TOKEN = 'xoxb-mock-12345'; // Valid format but not a real token

// Check if required environment variables are available
const hasRequiredEnvVars =
  process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID;

// Create conditional test runner - only run tests if environment variables are available
const itIfEnvVars = hasRequiredEnvVars ? it : it.skip;

describe('Slack SDK Integration Tests', () => {
  let slackSDK: ReturnType<typeof createSlackSDK>;

  beforeAll(() => {
    if (!hasRequiredEnvVars) {
      console.warn(
        'Skipping Slack SDK integration tests. Required environment variables not set.\n' +
          'Set SLACK_BOT_TOKEN and SLACK_CHANNEL_ID to run these tests.',
      );
    } else {
      console.log('Running tests with channel ID:', CHANNEL_ID);
      // Initialize SDK only if we have a real token
      slackSDK = createSlackSDK({
        botToken: process.env.SLACK_BOT_TOKEN as string,
        baseUrl: 'https://slack.com/api',
        authType: 'header',
      });
    }
  });

  describe('Message Operations', () => {
    itIfEnvVars('should send a basic message', async () => {
      const response = await slackSDK.sendMessage({
        channel: CHANNEL_ID,
        text: 'Test message from automated tests',
      });

      expect(response.ok).toBe(true);
      expect(response.channel).toBeDefined();
      expect(response.ts).toBeDefined();
    });

    itIfEnvVars(
      'should send a message with custom username and emoji',
      async () => {
        const response = await slackSDK.sendMessage({
          channel: CHANNEL_ID,
          text: 'Message with custom identity from tests',
          username: 'TestBot',
          icon_emoji: ':robot_face:',
        });

        expect(response.ok).toBe(true);
        expect(response.channel).toBeDefined();
        expect(response.ts).toBeDefined();
      },
    );

    itIfEnvVars('should send a message with blocks', async () => {
      const response = await slackSDK.sendMessage({
        channel: CHANNEL_ID,
        text: 'Block Kit test from automated tests',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Block Kit Test*\nTesting block components',
            },
          },
          {
            type: 'divider',
          },
        ],
      });

      expect(response.ok).toBe(true);
      expect(response.channel).toBeDefined();
      expect(response.ts).toBeDefined();
    });

    itIfEnvVars('should handle threading', async () => {
      // Send parent message
      const parent = await slackSDK.sendMessage({
        channel: CHANNEL_ID,
        text: 'Parent message from tests',
      });

      expect(parent.ok).toBe(true);
      expect(parent.ts).toBeDefined();

      if (!parent.ts) {
        throw new Error('Message timestamp not found');
      }

      // Reply in thread
      const reply = await slackSDK.sendMessage({
        channel: CHANNEL_ID,
        text: 'Thread reply from tests',
        thread_ts: parent.ts,
        reply_broadcast: true,
      });

      expect(reply.ok).toBe(true);
      expect(reply.ts).toBeDefined();
      expect(reply.message?.thread_ts).toBe(parent.ts);
    });

    itIfEnvVars('should update a message', async () => {
      // Send initial message
      const original = await slackSDK.sendMessage({
        channel: CHANNEL_ID,
        text: 'Original message from tests',
      });

      expect(original.ok).toBe(true);
      expect(original.ts).toBeDefined();

      if (!original.ts) {
        throw new Error('Message timestamp not found');
      }

      // Wait a moment to ensure message is processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the message
      const updated = await slackSDK.updateMessage({
        channel: CHANNEL_ID,
        ts: original.ts,
        text: 'Updated message from tests',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Updated*\nThis message has been modified by tests',
            },
          },
        ],
      });

      expect(updated.ok).toBe(true);
      expect(updated.ts).toBe(original.ts);
    });
  });

  describe('File Operations', () => {
    itIfEnvVars('should upload text content as a file', async () => {
      const testContent =
        'This is test content for the file upload.\nIt can span multiple lines.\nTesting file upload functionality.';

      const response = await slackSDK.uploadFile({
        channels: CHANNEL_ID,
        content: testContent,
        filename: 'test-automated.txt',
        filetype: 'text',
        title: 'Test File Upload from Automated Tests',
        initial_comment: 'Testing file upload with text content',
      });

      expect(response.ok).toBe(true);
      expect(response.file).toBeDefined();
      if (response.file) {
        expect(response.file.name).toBe('test-automated.txt');
        expect(response.file.title).toBe(
          'Test File Upload from Automated Tests',
        );
      }
    });
  });

  describe('Error Handling', () => {
    // These tests don't require valid credentials, so they can run without env vars
    it('should handle invalid channel errors', async () => {
      // Create SDK with valid token to test invalid channel
      if (!process.env.SLACK_BOT_TOKEN) {
        // Use mock token for testing when real token isn't available
        const testSDK = createSlackSDK({
          botToken: MOCK_TOKEN,
          baseUrl: 'https://slack.com/api',
          authType: 'header',
        });

        try {
          const response = await testSDK.sendMessage({
            channel: INVALID_CHANNEL,
            text: 'Test message to invalid channel',
          });

          // Test will likely fail at the API level rather than validation
          expect(response.ok).toBe(false);
        } catch (error) {
          // This is the expected outcome with a mock token
          expect(error).toBeDefined();
        }
        return;
      }

      const testSDK = createSlackSDK({
        botToken: process.env.SLACK_BOT_TOKEN,
        baseUrl: 'https://slack.com/api',
        authType: 'header',
      });

      try {
        const response = await testSDK.sendMessage({
          channel: INVALID_CHANNEL,
          text: 'Test message to invalid channel',
        });

        expect(response.ok).toBe(false);
        expect(response.error).toBeDefined();
        // The specific error might vary, so we just check it exists
      } catch (error) {
        // Also acceptable if it throws an error
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid token errors', async () => {
      const invalidSDK = createSlackSDK({
        botToken: INVALID_TOKEN,
        baseUrl: 'https://slack.com/api',
        authType: 'header',
      });

      try {
        const response = await invalidSDK.sendMessage({
          channel: CHANNEL_ID ?? '', // Use default channel ID if not provided
          text: 'Test message with invalid token',
        });

        expect(response.ok).toBe(false);
        expect(response.error).toBeDefined();
        // The specific error might vary, so we just check it exists
      } catch (error) {
        // Also acceptable if it throws an error
        expect(error).toBeDefined();
      }
    });
  });

  describe('Parallel Operations', () => {
    itIfEnvVars('should handle multiple messages in parallel', async () => {
      const messages = await Promise.all([
        slackSDK.sendMessage({
          channel: CHANNEL_ID,
          text: 'First parallel message from tests',
        }),
        slackSDK.sendMessage({
          channel: CHANNEL_ID,
          text: 'Second parallel message from tests',
        }),
        slackSDK.sendMessage({
          channel: CHANNEL_ID,
          text: 'Third parallel message from tests',
        }),
      ]);

      expect(messages).toHaveLength(3);
      messages.forEach(msg => {
        expect(msg.ok).toBe(true);
        expect(msg.channel).toBeDefined();
        expect(msg.ts).toBeDefined();
      });
    });
  });
});
