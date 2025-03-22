import { createDiscordSdk } from '@microfox/discord-sdk';

// Initialize the SDK
const discord = createDiscordSdk(process.env.DISCORD_BOT_TOKEN!);

export const discordSDKExamples = async () => {
  const channelId = process.env.CHANNEL_ID ?? '';
  const userId = process.env.USER_ID ?? '';

  if (!channelId) {
    throw new Error('CHANNEL_ID environment variable is required.');
  }

  console.log('Using Discord Channel ID:', channelId);

  try {
    console.log('\\n1. Sending plain text message...');
    const plainTextMessage = await discord.sendMessage({
      channelId,
      content: 'Hello from @microfox/discord-sdk! 🎉',
    });
    console.log('✅ Plain text message sent!');
    console.log('Message ID:', plainTextMessage.id);

    console.log('\\n2. Sending an image message...');
    const imageMessage = await discord.sendMessage({
      channelId,
      content: 'Check out this image!',
      fileUrl: 'https://example.com/sample-image.png',
    });
    console.log('✅ Image message sent!');
    console.log('Message ID:', imageMessage.id);

    console.log('\\n3. Editing the message...');
    await discord.editMessage(
      channelId,
      plainTextMessage.id,
      'Updated message with new text!',
    );

    console.log('\\n4. Reacting to the message...');
    await discord.reactToMessage(channelId, plainTextMessage.id, '🔥');

    console.log('\\n5. Fetching recent messages...');
    const messages = await discord.fetchMessages(channelId, 5);
    console.log('📩 Recent Messages:', messages);

    console.log('\\n6. Fetching user info...');
    if (userId) {
      const user = await discord.fetchUserInfo(userId);
      console.log('👤 User Info:', user);
    }

    console.log('\\n7. Fetching guild (server) info...');
    const guildId = process.env.GUILD_ID ?? '';
    if (guildId) {
      const guild = await discord.fetchGuildInfo(guildId);
      console.log('🏰 Guild Info:', guild);
    }

    console.log('\\n8. Deleting message...');
    await discord.deleteMessage(channelId, plainTextMessage.id);
    console.log('✅ Message deleted successfully!');
  } catch (error) {
    console.error('\\n❌ Error in Discord SDK examples:', error);
    throw error;
  }
};

// Run examples if executed directly
if (require.main === module) {
  discordSDKExamples()
    .then(() => console.log('Discord SDK examples completed successfully'))
    .catch(err => {
      console.error('Discord SDK examples failed:', err);
      process.exit(1);
    });
}
