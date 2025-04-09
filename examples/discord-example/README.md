# Discord SDK Examples

This folder contains example usage of the `@microfox/discord` package. These examples demonstrate how to interact with the Discord API using the SDK.

---

## 📌 Prerequisites

Before running the examples, ensure you have:

1. A **Discord bot** set up in the [Discord Developer Portal](https://discord.com/developers/applications).
2. The bot **added to a server** with the necessary permissions (Send Messages, Read Messages, Add Reactions, etc.).
3. The following **environment variables** configured:

```sh
DISCORD_BOT_TOKEN=your-bot-token
GUILD_ID=your-guild-id
CHANNEL_ID=your-channel-id
USER_ID=your-user-id
```

---

## 🚀 Example Usage

### **1️⃣ Sending a Plain Text Message**

```typescript
await discord.sendMessage({
  channelId: '123456789012345678',
  content: 'Hello, Discord! 🎉',
});
```

### **2️⃣ Sending an Image Message**

```typescript
await discord.sendMessage({
  channelId: '123456789012345678',
  content: "Here's an image!",
  fileUrl: 'https://example.com/sample-image.png',
});
```

### **3️⃣ Editing a Message**

```typescript
await discord.editMessage(
  '123456789012345678',
  '987654321098765432',
  'Updated message text!',
);
```

### **4️⃣ Deleting a Message**

```typescript
await discord.deleteMessage('123456789012345678', '987654321098765432');
```

### **5️⃣ Fetching Messages**

```typescript
const messages = await discord.fetchMessages('123456789012345678', 5);
console.log(messages);
```

### **6️⃣ Reacting to a Message**

```typescript
await discord.reactToMessage('123456789012345678', '987654321098765432', '🔥');
```

### **7️⃣ Creating a Thread**

```typescript
await discord.createThread(
  '123456789012345678',
  '987654321098765432',
  'New Discussion',
);
```

### **8️⃣ Fetching User Info**

```typescript
const user = await discord.fetchUserInfo('987654321098765432');
console.log(user);
```

### **9️⃣ Fetching Guild (Server) Info**

```typescript
const guild = await discord.fetchGuildInfo('123456789012345678');
console.log(guild);
```

---

## 🔥 Running the Example

To run the example script:

```sh
node example.ts
```

---

## 🧪 Running Integration Tests

To run the full test suite:

```sh
npm test
```

The tests automatically skip if **environment variables are missing**.  
Tests that require actual API calls use **real Discord credentials**, while validation tests use **mock data** to avoid unnecessary requests.

---

## 📝 Notes

- Ensure your **bot has the necessary permissions** in the Discord server.
- The bot **must be added to the server** before running these examples.
- If sending messages to **users (DMs)**, they must **allow DMs from server members** in their Discord settings.
- Discord **does not allow editing attachments**, so updating images replaces them using embeds.
