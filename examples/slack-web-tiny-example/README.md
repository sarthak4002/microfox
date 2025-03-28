# Slack SDK Examples

This directory contains example code demonstrating how to use the `@microfox/slack-web-tiny` package.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this directory with your Slack bot token and channel ID:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C0123456789  # Channel ID for sending messages
```

3. Make sure your Slack bot is added to the channel you want to send messages to.

## Running Tests

The tests use environment variables for authentication. Make sure your `.env` file is properly configured.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Note: Tests will automatically skip if required environment variables (`SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID`) are not set.

## Block Kit Builder

To visually design Block Kit messages, use the [Block Kit Builder](https://app.slack.com/block-kit-builder). You can copy the JSON output and use it with the SDK's helper functions.
