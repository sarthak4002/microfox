# @microfox/discord-sdk

A lightweight and efficient Discord SDK for interacting with the Discord API. This package provides simple methods for sending messages, managing reactions, fetching users and guilds, and more.

---

## 🚀 Features

✅ **Send & Edit Messages** (Text, Embeds, Media)  
✅ **Delete Messages**  
✅ **Fetch Messages**  
✅ **React to Messages**  
✅ **Create Threads**  
✅ **Fetch User & Guild Info**  
✅ **Lightweight & Optimized with `@microfox/rest-sdk`**

---

## 📦 Installation

Install via npm:

```sh
npm install @microfox/discord-sdk
```

or via yarn:

```sh
yarn add @microfox/discord-sdk
```

---

## 🚀 Usage

### **1️⃣ Initialize the SDK**

```typescript
import { createDiscordSdk } from '@microfox/discord-sdk';

const discord = createDiscordSdk('YOUR_DISCORD_BOT_TOKEN'); // or set token as DISCORD_BOT_TOKEN env
```

---

### **2️⃣ Send a Message**

```typescript
await discord.sendMessage({
  channelId: 'CHANNEL_ID', // or userId: "USER_ID"
  content: 'Hello, World!',
  fileUrl: 'https://example.com/image.png', // Optional media
});
```

---

### **3️⃣ Edit a Message**

```typescript
await discord.editMessage(
  'CHANNEL_ID',
  'MESSAGE_ID',
  'Updated message!',
  'https://example.com/new-image.png',
);
```

---

### **4️⃣ Delete a Message**

```typescript
await discord.deleteMessage('CHANNEL_ID', 'MESSAGE_ID');
```

---

### **5️⃣ Fetch Messages**

```typescript
const messages = await discord.fetchMessages('CHANNEL_ID', 5);
console.log(messages);
```

---

### **6️⃣ React to a Message**

```typescript
await discord.reactToMessage('CHANNEL_ID', 'MESSAGE_ID', '🔥');
```

---

### **7️⃣ Create a Thread**

```typescript
await discord.createThread('CHANNEL_ID', 'MESSAGE_ID', 'New Discussion');
```

---

### **8️⃣ Fetch User Information**

```typescript
const user = await discord.fetchUserInfo('USER_ID');
console.log(user);
```

---

### **9️⃣ Fetch Guild (Server) Information**

```typescript
const guild = await discord.fetchGuildInfo('GUILD_ID');
console.log(guild);
```

---

## 🛠️ API Methods

| Method                                                    | Description                              |
| --------------------------------------------------------- | ---------------------------------------- |
| `sendMessage(data)`                                       | Send a message (supports embeds & media) |
| `editMessage(channelId, messageId, newContent, fileUrl?)` | Edit a message (supports image embeds)   |
| `deleteMessage(channelId, messageId)`                     | Delete a message                         |
| `fetchMessages(channelId, limit?)`                        | Fetch recent messages from a channel     |
| `reactToMessage(channelId, messageId, emoji)`             | React to a message with an emoji         |
| `createThread(channelId, messageId, name)`                | Create a new thread in a channel         |
| `fetchUserInfo(userId)`                                   | Fetch user profile details               |
| `fetchGuildInfo(guildId)`                                 | Fetch Discord server (guild) details     |

---

## 📝 Notes

- Make sure your bot has the correct permissions to send messages, react, or fetch data.
- If sending messages to users (DMs), they must have **"Allow DMs from server members"** enabled.
- Attachments **cannot be edited** in Discord, so image updates use embeds.
