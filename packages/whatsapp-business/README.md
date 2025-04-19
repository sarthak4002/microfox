# @microfox/whatsapp-business-sdk

A lightweight, type-safe SDK for interacting with the WhatsApp Business API. This SDK provides a simple and intuitive interface to send various types of messages through the WhatsApp Business API.

## Features

- 🔒 Type-safe API with TypeScript
- 📱 Support for all WhatsApp message types
- 🚀 Easy to use and integrate
- 🔄 Built-in error handling
- 📦 Lightweight and dependency-free

## Installation

```bash
npm install @microfox/whatsapp-business-sdk
```

## Quick Start

```typescript
import { WhatsAppBusinessSDK } from '@microfox/whatsapp-business-sdk';

// Initialize the SDK
const whatsapp = new WhatsAppBusinessSDK({
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  businessAccountId: 'YOUR_BUSINESS_ACCOUNT_ID',
  accessToken: 'YOUR_ACCESS_TOKEN',
});

// Send a text message
await whatsapp.sendTextMessage(
  'RECIPIENT_PHONE_NUMBER',
  'Hello from WhatsApp Business API!',
);
```

## Configuration

The SDK requires the following configuration:

```typescript
interface WhatsAppSDKConfig {
  phoneNumberId: string; // Your WhatsApp Business phone number ID
  businessAccountId: string; // Your WhatsApp Business account ID
  accessToken: string; // Your WhatsApp Business API access token
  version?: string; // Optional: API version (defaults to v22.0)
  baseUrl?: string; // Optional: Custom base URL
}
```

## Message Types

### Text Messages

```typescript
await whatsapp.sendTextMessage(
  'RECIPIENT_PHONE_NUMBER',
  'Hello from WhatsApp Business API!',
  {
    previewUrl: true, // Enable link preview
  },
);
```

### Media Messages

#### Image

```typescript
await whatsapp.sendImageMessage('RECIPIENT_PHONE_NUMBER', {
  id: 'MEDIA_ID', // Upload media first to get ID
  caption: 'Optional caption',
});
```

#### Video

```typescript
await whatsapp.sendVideoMessage('RECIPIENT_PHONE_NUMBER', {
  id: 'MEDIA_ID',
  caption: 'Optional caption',
});
```

#### Document

```typescript
await whatsapp.sendDocumentMessage('RECIPIENT_PHONE_NUMBER', {
  id: 'MEDIA_ID',
  filename: 'document.pdf',
});
```

#### Audio

```typescript
await whatsapp.sendAudioMessage('RECIPIENT_PHONE_NUMBER', {
  id: 'MEDIA_ID',
});
```

#### Sticker

```typescript
await whatsapp.sendStickerMessage('RECIPIENT_PHONE_NUMBER', {
  id: 'MEDIA_ID',
});
```

### Location Messages

```typescript
await whatsapp.sendLocationMessage('RECIPIENT_PHONE_NUMBER', {
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco',
  address: 'Optional address',
});
```

### Contact Messages

```typescript
await whatsapp.sendContactMessage('RECIPIENT_PHONE_NUMBER', [
  {
    name: {
      formatted_name: 'John Doe',
      first_name: 'John',
    },
    phones: [
      {
        phone: '+1234567890',
        type: 'CELL',
      },
    ],
  },
]);
```

### Interactive Messages

#### Buttons

```typescript
await whatsapp.sendInteractiveMessage('RECIPIENT_PHONE_NUMBER', {
  type: 'button',
  body: {
    text: 'Choose an option:',
  },
  action: {
    buttons: [
      {
        type: 'reply',
        reply: {
          id: '1',
          title: 'Option 1',
        },
      },
      {
        type: 'reply',
        reply: {
          id: '2',
          title: 'Option 2',
        },
      },
    ],
  },
});
```

#### Lists

```typescript
await whatsapp.sendInteractiveMessage('RECIPIENT_PHONE_NUMBER', {
  type: 'list',
  body: {
    text: 'Choose an option:',
  },
  action: {
    button: 'Select',
    sections: [
      {
        title: 'Section 1',
        rows: [
          {
            id: '1',
            title: 'Option 1',
            description: 'Description 1',
          },
          {
            id: '2',
            title: 'Option 2',
            description: 'Description 2',
          },
        ],
      },
    ],
  },
});
```

### Template Messages

```typescript
await whatsapp.sendTemplateMessage(
  'RECIPIENT_PHONE_NUMBER',
  'template_name',
  'en',
  [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: 'value',
        },
      ],
    },
  ],
);
```

## Error Handling

The SDK throws `WhatsAppBusinessSDKError` for API errors:

```typescript
try {
  await whatsapp.sendTextMessage('RECIPIENT_PHONE_NUMBER', 'Hello!');
} catch (error) {
  if (error instanceof WhatsAppBusinessSDKError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error('Original error:', error.originalError);
  }
}
```

## Media Management

### Upload Media

```typescript
const mediaId = await whatsapp.uploadMedia(file, 'image');
```

### Download Media

```typescript
const mediaData = await whatsapp.downloadMedia('MEDIA_ID');
```

### Get Media URL

```typescript
const mediaUrl = await whatsapp.getMediaUrl('MEDIA_ID');
```

## Business Profile

### Get Business Profile

```typescript
const profile = await whatsapp.getBusinessProfile();
```

### Update Business Profile

```typescript
await whatsapp.updateBusinessProfile({
  about: 'New about text',
  address: 'New address',
  description: 'New description',
  email: 'new@email.com',
  website: ['https://example.com'],
});
```

## Templates

### Get Templates

```typescript
const templates = await whatsapp.getTemplates({
  limit: 10,
  offset: 0,
});
```

### Create Template

```typescript
await whatsapp.createTemplate({
  name: 'template_name',
  category: 'MARKETING',
  language: 'en',
  components: [
    {
      type: 'BODY',
      text: 'Hello {{1}}!',
    },
  ],
});
```

### Delete Template

```typescript
await whatsapp.deleteTemplate('template_name');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
