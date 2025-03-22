import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createDiscordSdk } from '@microfox/discord-sdk';

// Check for required environment variables
const hasRequiredEnvVars =
  process.env.DISCORD_BOT_TOKEN && process.env.CHANNEL_ID;
const itIfEnvVars = hasRequiredEnvVars ? it : it.skip;

describe('Discord SDK Integration Tests', () => {
  let discord: ReturnType<typeof createDiscordSdk>;

  beforeAll(() => {
    if (hasRequiredEnvVars) {
      discord = createDiscordSdk(process.env.DISCORD_BOT_TOKEN!);
      console.log('Discord SDK initialized with token.');
    } else {
      console.warn(
        'Skipping Discord SDK tests: Missing required environment variables.',
      );
    }
  });

  describe('Message Operations', () => {
    itIfEnvVars('should send a plain text message', async () => {
      const response = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'Test message from Discord SDK',
      });

      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
    });

    itIfEnvVars('should send an image message', async () => {
      const response = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'Test image message',
        fileUrl: 'https://example.com/sample-image.png',
      });

      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
    });

    itIfEnvVars('should edit a message', async () => {
      const message = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'Message to be edited',
      });

      await discord.editMessage(
        process.env.CHANNEL_ID!,
        message.id,
        'Updated content',
      );

      expect(message.id).toBeDefined();
    });

    itIfEnvVars('should delete a message', async () => {
      const message = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'Message to be deleted',
      });

      await discord.deleteMessage(process.env.CHANNEL_ID!, message.id);
      console.log('✅ Message deleted successfully!');
    });
  });

  describe('User & Guild Operations', () => {
    itIfEnvVars('should fetch user info', async () => {
      const userId = process.env.USER_ID!;
      const response = await discord.fetchUserInfo(userId);

      expect(response.id).toBe(userId);
      expect(typeof response.username).toBe('string');
    });

    itIfEnvVars('should fetch guild info', async () => {
      const guildId = process.env.GUILD_ID!;
      const response = await discord.fetchGuildInfo(guildId);

      expect(response.id).toBe(guildId);
      expect(typeof response.name).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid message data', async () => {
      await expect(
        discord.sendMessage({
          channelId: '',
          content: '',
        }),
      ).rejects.toThrow();
    });

    it('should reject invalid token', async () => {
      const invalidDiscord = createDiscordSdk('INVALID_TOKEN');

      await expect(
        invalidDiscord.sendMessage({
          channelId: process.env.CHANNEL_ID!,
          content: 'Invalid token test',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Reactions & Threads', () => {
    itIfEnvVars('should react to a message', async () => {
      const message = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'React to this message',
      });

      await discord.reactToMessage(process.env.CHANNEL_ID!, message.id, '🔥');
      console.log('✅ Reaction added successfully!');
    });

    itIfEnvVars('should create a thread', async () => {
      const message = await discord.sendMessage({
        channelId: process.env.CHANNEL_ID!,
        content: 'Thread starter message',
      });

      const thread = await discord.createThread(
        process.env.CHANNEL_ID!,
        message.id,
        'New Discussion',
      );

      expect(thread.id).toBeDefined();
      expect(typeof thread.id).toBe('string');
    });
  });
});
