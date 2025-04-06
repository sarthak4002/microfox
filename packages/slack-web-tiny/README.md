# Slack Web Tiny SDK

A lightweight, type-safe SDK for interacting with the Slack Web API.

## Installation

```bash
npm install @microfox/slack-web-tiny
```

## Usage

```typescript
import { createSlackSDK } from '@microfox/slack-web-tiny';

// Initialize the SDK with your Slack bot token
const slackSDK = createSlackSDK({
  botToken: process.env.SLACK_BOT_TOKEN ?? 'xoxb-your-bot-token',
  authType: 'header',
  baseUrl: 'https://slack.com/api',
});

// Send a simple message
const response = await slackSDK.sendMessage({
  channel: 'C1234567890', // Channel ID
  text: 'Hello from Slack SDK!',
});

// Send a message in a thread
const threadResponse = await slackSDK.sendMessage({
  channel: 'C1234567890', // Channel ID
  text: 'Reply in thread',
  thread_ts: '1234567890.123456', // Thread timestamp
});

// Update an existing message
const updatedResponse = await slackSDK.updateMessage({
  channel: 'C1234567890', // Channel ID
  ts: '1234567890.123456', // Message timestamp to update
  text: 'Updated message content',
});

// Upload a file
const fileResponse = await slackSDK.uploadFile({
  channels: 'C1234567890', // Channel ID
  content: 'File content as text',
  filename: 'example.txt',
  title: 'Example File',
});

// Use Block Kit components
const blockMessage = await slackSDK.sendMessage({
  channel: 'C1234567890', // Channel ID
  text: 'Fallback text for notifications',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Hello* from Block Kit!',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: 'Click me' },
        action_id: 'click_me',
        url: 'https://example.com',
      },
    },
  ],
});

// Helper functions for creating Block Kit components
const { blocks } = slackSDK;

const message = await slackSDK.sendMessage({
  channel: 'C1234567890', // Channel ID
  text: 'Block Kit helpers example',
  blocks: [
    blocks.section('A section with *markdown*'),
    blocks.divider(),
    blocks.section('Click the button:', {
      accessory: blocks.button('Click Me', 'button_click_action'),
    }),
  ],
});
```

## API Reference

### `createSlackSDK(config: SlackSDKConfig)`

Creates a new instance of the Slack SDK.

#### Config Options

- `botToken` (string, required): Your Slack bot user OAuth token
- `authType` ('header' | 'query', optional): Authentication method (defaults to 'header')
- `baseUrl` (string, optional): Override the default Slack API URL (defaults to 'https://slack.com/api')

### `sendMessage(message: SlackMessage)`

Sends a message to a Slack channel.

#### Message Options

- `channel` (string, required): Channel ID (e.g., 'C1234567890')
- `text` (string, required): Message text or fallback for Block Kit messages
- `blocks` (Block[], optional): Array of Block Kit blocks for rich layout
- `attachments` (Attachment[], optional): Legacy attachments
- `thread_ts` (string, optional): Timestamp of the parent message to reply in a thread
- `reply_broadcast` (boolean, optional): Whether to broadcast a thread reply to the channel
- `mrkdwn` (boolean, optional): Enable/disable Slack markdown parsing
- `unfurl_links` (boolean, optional): Enable/disable URL unfurling
- `unfurl_media` (boolean, optional): Enable/disable media unfurling
- `parse` ('none' | 'full', optional): Set parsing mode
- `username` (string, optional): Custom bot username
- `icon_emoji` (string, optional): Custom bot emoji icon
- `icon_url` (string, optional): Custom bot image URL

### `updateMessage(message: UpdateMessage)`

Updates an existing message in a Slack channel.

#### Update Message Options

- `channel` (string, required): Channel ID containing the message
- `ts` (string, required): Timestamp of the message to update
- `text` (string, optional): New message text
- `blocks` (Block[], optional): New Block Kit blocks
- `attachments` (Attachment[], optional): New legacy attachments
- `parse` ('none' | 'full', optional): Set parsing mode
- `link_names` (boolean, optional): Link channel names and usernames
- `as_user` (boolean, optional): Update as authenticated user

### `uploadFile(file: FileUpload)`

Uploads a file to Slack.

#### File Upload Options

- `channels` (string, optional): Channel ID to share the file
- `content` (string, optional): Text content of the file
- `filename` (string, optional): Name of the file
- `filetype` (string, optional): File type identifier (e.g., 'txt', 'pdf')
- `initial_comment` (string, optional): Comment to add to the file
- `thread_ts` (string, optional): Timestamp of thread to upload to
- `title` (string, optional): Title of the file

### Block Kit Helpers

The SDK provides helper functions for creating Block Kit components:

- `blocks.text(text, type)` - Create text object
- `blocks.section(text, fields)` - Create section block
- `blocks.divider()` - Create divider block
- `blocks.button(text, actionId, options)` - Create button element

## Error Handling

The SDK uses Zod for runtime type validation and will throw errors if:

- The message payload doesn't match the expected schema
- The API response doesn't match the expected schema
- The API request fails

Example:

```typescript
try {
  const response = await slackSDK.sendMessage({
    channel: 'C1234567890', // Channel ID
    text: 'Hello world',
  });
  console.log('Message sent:', response);
} catch (error) {
  console.error('Failed to send message:', error);
}
```
