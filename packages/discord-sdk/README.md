# @microfox/discord-sdk

Discord SDK for Microfox

## Installation

```bash
npm install @microfox/discord-sdk
```

## Usage

```typescript
import { createDiscordSdk } from '@microfox/discord-sdk';

const discordSdk = createDiscordSdk({
  botToken: 'YOUR_BOT_TOKEN',
});
```

## API Reference

### sendMessage

Send a message to a user or a channel.

```typescript
const response = await discordSdk.sendMessage({
  content: 'Hello, Discord!',
  channelId: 'CHANNEL_ID',
});
```

### fetchMessage

Fetch a message by its ID.

```typescript
const message = await discordSdk.fetchMessage('MESSAGE_ID', 'CHANNEL_ID');
```

### editMessage

Edit an existing message.

```typescript
const updatedMessage = await discordSdk.editMessage(
  'MESSAGE_ID',
  'CHANNEL_ID',
  {
    content: 'Updated message content',
  },
);
```

### deleteMessage

Delete a message.

```typescript
await discordSdk.deleteMessage('MESSAGE_ID', 'CHANNEL_ID');
```

### fetchGuildInfo

Fetch information about a guild.

```typescript
const guildInfo = await discordSdk.fetchGuildInfo('GUILD_ID');
```

### fetchUserInfo

Fetch information about a user.

```typescript
const userInfo = await discordSdk.fetchUserInfo('USER_ID');
```

### registerSlashCommand

Register a slash command for the bot.

```typescript
const command = await discordSdk.registerSlashCommand('GUILD_ID', {
  name: 'hello',
  description: 'Say hello',
  options: [
    {
      name: 'name',
      description: 'Your name',
      type: 3,
      required: true,
    },
  ],
});
```

### registerGlobalSlashCommand

Register global slash commands for the bot.

```typescript
const command = await discordSdk.registerGlobalSlashCommand({
  name: 'ping',
  description: 'Ping the bot',
});
```

### deleteSlashCommand

Delete a slash command.

```typescript
await discordSdk.deleteSlashCommand('GUILD_ID', 'COMMAND_ID');
```

### deleteGlobalSlashCommand

Delete a global slash command.

```typescript
await discordSdk.deleteGlobalSlashCommand('COMMAND_ID');
```

### moderateUser

Perform a moderation action on a user.

```typescript
await discordSdk.moderateUser('GUILD_ID', 'USER_ID', {
  type: 'ban',
  reason: 'Violation of server rules',
  delete_message_days: 7,
});
```

### createChannel

Create a new channel in the guild.

```typescript
const channel = await discordSdk.createChannel('GUILD_ID', {
  name: 'new-channel',
  type: 0, // Text channel
});
```

### updateChannel

Update a channel's settings.

```typescript
const updatedChannel = await discordSdk.updateChannel('CHANNEL_ID', {
  name: 'updated-channel-name',
  topic: 'New channel topic',
});
```

### deleteChannel

Delete a channel.

```typescript
await discordSdk.deleteChannel('CHANNEL_ID');
```

### createRole

Create a new role in the guild.

```typescript
const role = await discordSdk.createRole('GUILD_ID', {
  name: 'New Role',
  color: 0xff0000,
  permissions: '0',
});
```

### updateRole

Update a role's settings.

```typescript
const updatedRole = await discordSdk.updateRole('GUILD_ID', 'ROLE_ID', {
  name: 'Updated Role Name',
  color: 0x00ff00,
});
```

### deleteRole

Delete a role.

```typescript
await discordSdk.deleteRole('GUILD_ID', 'ROLE_ID');
```

### addRoleToUser

Add a role to a user.

```typescript
await discordSdk.addRoleToUser('GUILD_ID', 'USER_ID', 'ROLE_ID', 'Promotion');
```

### removeRoleFromUser

Remove a role from a user.

```typescript
await discordSdk.removeRoleFromUser(
  'GUILD_ID',
  'USER_ID',
  'ROLE_ID',
  'Demotion',
);
```

### fetchChannels

Fetch all channels in a guild.

```typescript
const channels = await discordSdk.fetchChannels('GUILD_ID');
```

### fetchRoles

Fetch all roles in a guild.

```typescript
const roles = await discordSdk.fetchRoles('GUILD_ID');
```

### fetchSlashCommands

Fetch all slash commands for a guild.

```typescript
const commands = await discordSdk.fetchSlashCommands('GUILD_ID');
```

### fetchGlobalSlashCommands

Fetch all global slash commands.

```typescript
const globalCommands = await discordSdk.fetchGlobalSlashCommands();
```

### registerCommand

Register a command handler for a guild-specific slash command.

```typescript
await discordSdk.registerCommand('GUILD_ID', {
  name: 'greet',
  description: 'Greet a user',
  options: [
    {
      name: 'user',
      description: 'The user to greet',
      type: 6,
      required: true,
    },
  ],
  handler: async (interaction, options) => {
    const user = options.user;
    await discordSdk.respondToInteraction(interaction.token, {
      content: `Hello, <@${user}>!`,
    });
  },
});
```

### registerGlobalCommand

Register a command handler for a global slash command.

```typescript
await discordSdk.registerGlobalCommand({
  name: 'ping',
  description: 'Ping the bot',
  handler: async interaction => {
    await discordSdk.respondToInteraction(interaction.token, {
      content: 'Pong!',
    });
  },
});
```

### handleInteraction

Handle a slash command interaction.

```typescript
// In your interaction handling logic
discordSdk.handleInteraction(interactionData);
```

### respondToInteraction

Respond to a slash command interaction.

```typescript
await discordSdk.respondToInteraction(interaction.token, {
  content: 'Command executed successfully!',
  ephemeral: true,
});
```

### deferInteraction

Defer a slash command response.

```typescript
await discordSdk.deferInteraction(interaction.token, true); // true for ephemeral response
```

### followUpInteraction

Follow up to a deferred interaction.

```typescript
await discordSdk.followUpInteraction(interaction.token, {
  content: 'Here is the follow-up response!',
  ephemeral: true,
});
```

## Types

The SDK exports various TypeScript types and schemas for Discord entities:

- `DiscordSlashCommandSchema`
- `DiscordModerationActionSchema`
- `DiscordChannelSchema`
- `DiscordRoleSchema`
- `DiscordCommandHandlerSchema`
- `DiscordSlashCommandInteractionSchema`
- `DiscordCommandHandler`
- `DiscordResponses`

You can import these types for use in your TypeScript projects:

```typescript
import { DiscordSlashCommandSchema } from '@microfox/discord-sdk';
```

## 📝 Notes

- Make sure your bot has the correct permissions to send messages, react, or fetch data.
- If sending messages to users (DMs), they must have **"Allow DMs from server members"** enabled.
- Attachments **cannot be edited** in Discord, so image updates use embeds.
