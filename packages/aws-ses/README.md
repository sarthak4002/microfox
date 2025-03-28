# @microfox/aws-ses

A type-safe AWS SES SDK for sending emails, built with TypeScript and Zod.

## Features

- ✅ Type-safe interfaces with Zod validation
- 🚀 Simple and intuitive API
- 📦 Built on top of @microfox/rest-sdk
- 🔒 Implements AWS SES authentication (Signature Version 4)
- 📧 Support for single and bulk email sending

## Installation

```bash
npm install @microfox/aws-ses
# or
yarn add @microfox/aws-ses
# or
pnpm add @microfox/aws-ses
```

## Usage

### Initialize with AWS Credentials

```typescript
import { createSESSdk } from '@microfox/aws-ses';

// Create the SDK instance
const ses = createSESSdk({
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1',
});
```

### Send email with plain text body

```typescript
await ses.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'Hello!',
  bodyText: 'This is a test email (plain text version)',
});
```

### Send email with Html body

```typescript
await ses.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'Hello!',
  bodyHtml: '<p>This is a test email</p>',
});
```

### Sending emails with display name

```typescript
await ses.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  displayName: 'Your Company Name',
  subject: 'Hello!',
  bodyHtml: '<p>This is a test email</p>',
  bodyText: 'This is a test email (plain text version)',
});
```

### Sending bulk emails

```typescript
await ses.sendBulkEmails({
  sender: 'sender@example.com',
  recipients: [
    'recipient1@example.com',
    'recipient2@example.com',
    'recipient3@example.com',
  ],
  displayName: 'Your Company Name',
  subject: 'Hello!',
  bodyHtml: '<p>This is a test email</p>',
  bodyText: 'This is a test email (plain text version)',
});
```

## API Reference

### `createSESSdk(config)`

Creates a new AWS SES SDK instance.

#### Parameters

- `config` - Configuration object
  - `accessKeyId` - AWS access key ID
  - `secretAccessKey` - AWS secret access key
  - `region` - AWS region (e.g., 'us-east-1')

#### Returns

An object with the following methods:

- `sendEmail(params)` - Send a single email

  - `params` - Email parameters
    - `sender` - Sender email address
    - `recipient` - Recipient email address
    - `displayName` - (Optional) Sender display name
    - `subject` - Email subject
    - `bodyHtml` - HTML email body
    - `bodyText` - Plain text email body

- `sendBulkEmails(params)` - Send multiple emails
  - `params` - Bulk email parameters
    - `sender` - Sender email address
    - `recipients` - Array of recipient email addresses
    - `displayName` - (Optional) Sender display name
    - `subject` - Email subject
    - `bodyHtml` - HTML email body
    - `bodyText` - Plain text email body

## License

MIT
