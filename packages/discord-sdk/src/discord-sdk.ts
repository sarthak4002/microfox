import { z } from 'zod';
import { createRestSDK } from '@microfox/rest-sdk';

const MessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').optional(),
  userId: z.string().optional(),
  channelId: z.string().optional(),
  fileUrl: z.string().url().optional(),
  embed: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      color: z.number().optional(),
      image: z.string().url().optional(),
    })
    .optional(),
});

export const createDiscordSdk = (token?: string) => {
  const BASE_URL = 'https://discord.com/api/v10';
  const botToken = token || process.env.DISCORD_BOT_TOKEN;

  if (!botToken) throw new Error('Discord bot token is required');

  // Initialize Microfox REST Client
  const restSdk = createRestSDK({
    baseUrl: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
  });

  const request = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    body?: any,
  ) => {
    try {
      const textResponse = await restSdk[
        method.toLowerCase() as keyof typeof restSdk
      ](endpoint, body).text();
      const jsonResponse = textResponse ? JSON.parse(textResponse) : {};

      return jsonResponse;
    } catch (error: any) {
      console.error(`❌ API Error: ${error.message}`, error);
      throw new Error(`API Error: ${error.message}`);
    }
  };

  return {
    /**
     * Send a message to a user or a channel.
     */
    sendMessage: async (data: z.infer<typeof MessageSchema>) => {
      const parsedData = MessageSchema.parse(data);
      if (!parsedData.content && !parsedData.fileUrl && !parsedData.embed) {
        throw new Error('Either content, fileUrl, or embed must be provided');
      }

      let channelId = parsedData.channelId;

      if (parsedData.userId) {
        const dmChannel = await request('/users/@me/channels', 'POST', {
          recipient_id: parsedData.userId,
        });
        channelId = dmChannel.id;
      }

      if (!channelId)
        throw new Error('Either userId or channelId must be provided');

      const payload: any = { content: parsedData.content || '' };
      if (parsedData.fileUrl)
        payload.embeds = [{ image: { url: parsedData.fileUrl } }];
      if (parsedData.embed) payload.embeds = [parsedData.embed];

      return request(`/channels/${channelId}/messages`, 'POST', payload);
    },

    /**
     * Edit an existing message in a channel.
     * Now supports media (via embeds).
     */
    editMessage: async (
      channelId: string,
      messageId: string,
      newContent: string,
      fileUrl?: string,
    ) => {
      const payload: any = { content: newContent };
      if (fileUrl) {
        payload.embeds = [{ image: { url: fileUrl } }];
      }
      return request(
        `/channels/${channelId}/messages/${messageId}`,
        'PATCH',
        payload,
      );
    },

    /**
     * Delete a message in a channel.
     * Handles empty response issue from Discord API.
     */
    deleteMessage: async (channelId: string, messageId: string) => {
      try {
        await request(`/channels/${channelId}/messages/${messageId}`, 'DELETE');
      } catch (error) {
        console.error(`❌ Error deleting message ${messageId}:`, error);
      }
    },

    /**
     * Fetch recent messages from a channel.
     */
    fetchMessages: async (channelId: string, limit: number = 10) => {
      return request(`/channels/${channelId}/messages?limit=${limit}`, 'GET');
    },

    /**
     * React to a message with an emoji.
     */
    reactToMessage: async (
      channelId: string,
      messageId: string,
      emoji: string,
    ) => {
      return request(
        `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
        'PUT',
      );
    },

    /**
     * Create a thread in a channel.
     */
    createThread: async (
      channelId: string,
      messageId: string,
      name: string,
    ) => {
      return request(
        `/channels/${channelId}/messages/${messageId}/threads`,
        'POST',
        { name },
      );
    },

    /**
     * Fetch information about a guild (server).
     */
    fetchGuildInfo: async (guildId: string) => {
      return request(`/guilds/${guildId}`, 'GET');
    },

    /**
     * Fetch information about a user.
     */
    fetchUserInfo: async (userId: string) => {
      return request(`/users/${userId}`, 'GET');
    },
  };
};
