# @microfox/whatsapp-business

A lightweight, type-safe SDK for interacting with the WhatsApp Business API. This SDK provides a simple and intuitive interface to send various types of messages through the WhatsApp Business API.

## Features

- 🔒 Type-safe API with TypeScript
- 📱 Support for all WhatsApp message types
- 🚀 Easy to use and integrate
- 🔄 Built-in error handling
- 📦 Lightweight and dependency-free
- 💬 Conversational Components Support
- 📊 Analytics and insights
- 🛍️ Commerce settings management
- 📱 Phone number management
- 📝 Template management
- 📸 Media handling

## Installation

```bash
npm install @microfox/whatsapp-business
```

## Quick Start

```typescript
import { WhatsAppBusinessSDK } from '@microfox/whatsapp-business';

// Initialize the SDK
const whatsapp = new WhatsAppBusinessSDK({
  phoneNumberId: process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  accessToken: process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN,
});
// Optional parameters
// version: 'v22.0', // Optional: defaults to v22.0
// baseUrl: 'https://graph.facebook.com/v22.0', // Optional: custom base URL

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

## Conversational Components

Conversational components are in-chat features that make it easier for WhatsApp users to interact with your business. They include ice breakers and commands that users can tap or type to interact with your business.

> **Important Note**: Make sure `WHATSAPP_WEBHOOK_URL` is set as an environment variable. The Conversational components require whatsapp webhook url.

### Ice Breakers

Ice breakers are customizable, tappable text strings that appear in a message thread the first time you chat with a user. You can configure up to 4 ice breakers, each with a maximum of 80 characters.

### Commands

Commands are text strings that WhatsApp users can see by typing a forward slash in a message thread. You can define up to 30 commands, each with a maximum of 32 characters for the command name and 256 characters for the description.

### Configure Conversational Components

You can configure ice breakers and commands separately or together. Here are examples for each scenario:

#### Configure Only Ice Breakers

```typescript
await whatsapp.configureConversationalComponents({
  enable_welcome_message: true,
  prompts: ['Book a flight', 'Plan a vacation', 'Find hotels', 'Rent a car'],
});
```

#### Configure Only Commands

```typescript
await whatsapp.configureConversationalComponents({
  enable_welcome_message: true,
  commands: [
    {
      command_name: 'tickets',
      command_description: 'Book flight tickets',
    },
    {
      command_name: 'hotel',
      command_description: 'Book hotel',
    },
  ],
});
```

#### Configure Both Ice Breakers and Commands

```typescript
await whatsapp.configureConversationalComponents({
  enable_welcome_message: true,
  prompts: ['Book a flight', 'Plan a vacation', 'Find hotels', 'Rent a car'],
  commands: [
    {
      command_name: 'tickets',
      command_description: 'Book flight tickets',
    },
    {
      command_name: 'hotel',
      command_description: 'Book hotel',
    },
  ],
});
```

> **Important Note**: While Conversational Components can be reconfigured, it's recommended to avoid frequent changes as they can confuse users and disrupt their interaction patterns with your business. It's best to carefully plan your ice breakers and commands before implementation and only update them when absolutely necessary.

### Get Current Configuration

```typescript
const config = await whatsapp.getConversationalComponents();
console.log(config);
// {
//   enable_welcome_message: true,
//   prompts: ["Book a flight", "Plan a vacation"],
//   commands: [
//     { command_name: "tickets", command_description: "Book flight tickets" }
//   ]
// }
```

## Common Message Options

All message types support the following options:

```typescript
interface MessageOptions {
  recipientType?: 'individual' | 'group'; // Default: 'individual'
  checkWindow?: boolean; // Check if recipient is within the 24-hour window
  templateFallback?: {
    // Fallback template if outside 24-hour window
    name: string;
    language: string;
    components?: any[];
  };
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
    ...MessageOptions,
  },
);
```

### Media Messages

When sending media messages, you have two options for providing the media content:

1. **Using Media ID (Recommended)**:

   - First upload the media using `uploadMedia()` to get a MEDIA_ID
   - Then use this ID in your message
   - This is the recommended approach as it's more reliable and secure
   - Required for all media types when sending through the WhatsApp Business API

2. **Using Direct Link (Alternative)**:
   - Provide a direct HTTPS URL to the media
   - The URL must be publicly accessible
   - Only supported for certain media types and in specific cases
   - Not recommended for production use

Common media options:

```typescript
interface MediaOptions {
  mime_type?: string;
  sha256?: string;
  caption?: string;
}
```

#### Image

```typescript
// Option 1: Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'image');
await whatsapp.sendImageMessage('RECIPIENT_PHONE_NUMBER', {
  id: mediaId,
  ...MediaOptions,
});

// Option 2: Using Direct Link (Alternative)
await whatsapp.sendImageMessage('RECIPIENT_PHONE_NUMBER', {
  link: 'https://example.com/image.jpg',
  ...MediaOptions,
});
```

#### Video

```typescript
// Option 1: Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'video');
await whatsapp.sendVideoMessage('RECIPIENT_PHONE_NUMBER', {
  id: mediaId,
  ...MediaOptions,
});

// Option 2: Using Direct Link (Alternative)
await whatsapp.sendVideoMessage('RECIPIENT_PHONE_NUMBER', {
  link: 'https://example.com/video.mp4',
  ...MediaOptions,
});
```

#### Document

```typescript
// Option 1: Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'document');
await whatsapp.sendDocumentMessage('RECIPIENT_PHONE_NUMBER', {
  id: mediaId,
  filename: 'document.pdf',
  ...MediaOptions,
});

// Option 2: Using Direct Link (Alternative)
await whatsapp.sendDocumentMessage('RECIPIENT_PHONE_NUMBER', {
  link: 'https://example.com/document.pdf',
  filename: 'document.pdf',
  ...MediaOptions,
});
```

#### Audio

```typescript
// Option 1: Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'audio');
await whatsapp.sendAudioMessage('RECIPIENT_PHONE_NUMBER', {
  id: mediaId,
  ...MediaOptions,
});

// Option 2: Using Direct Link (Alternative)
await whatsapp.sendAudioMessage('RECIPIENT_PHONE_NUMBER', {
  link: 'https://example.com/audio.mp3',
  ...MediaOptions,
});
```

#### Sticker

```typescript
// Option 1: Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'sticker');
await whatsapp.sendStickerMessage('RECIPIENT_PHONE_NUMBER', {
  id: mediaId,
  ...MediaOptions,
});

// Option 2: Using Direct Link (Alternative)
await whatsapp.sendStickerMessage('RECIPIENT_PHONE_NUMBER', {
  link: 'https://example.com/sticker.webp',
  ...MediaOptions,
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
      last_name: 'Doe',
      middle_name: 'M',
      suffix: 'Jr',
      prefix: 'Mr',
    },
    phones: [
      {
        phone: '+1234567890',
        type: 'CELL',
        wa_id: '1234567890',
      },
    ],
    emails: [
      {
        email: 'john@example.com',
        type: 'WORK',
      },
    ],
    urls: [
      {
        url: 'https://example.com',
        type: 'WORK',
      },
    ],
    addresses: [
      {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States',
        country_code: 'US',
        type: 'WORK',
      },
    ],
    org: {
      company: 'Example Corp',
      department: 'Engineering',
      title: 'Software Engineer',
    },
    birthday: '1990-01-01',
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

Template messages are pre-approved message formats that can be sent to users outside the 24-hour window. They are useful for sending notifications, updates, and marketing messages.

#### Send Template Message

```typescript
await whatsapp.sendTemplateMessage(
  'RECIPIENT_PHONE_NUMBER',
  'template_name',
  'en',
  [
    {
      type: 'header',
      format: 'TEXT',
      text: 'Hello {{1}}!',
      example: {
        header_handle: ['John'],
      },
    },
    {
      type: 'body',
      text: 'Welcome to our service!',
      parameters: [
        {
          type: 'text',
          text: 'John',
        },
        {
          type: 'currency',
          currency: {
            fallback_value: '$10.00',
            code: 'USD',
            amount_1000: 10000,
          },
        },
        {
          type: 'date_time',
          date_time: {
            fallback_value: '2024-01-01',
          },
        },
      ],
      example: {
        body_text: [['John', '$10.00', '2024-01-01']],
      },
    },
    {
      type: 'footer',
      text: 'Thank you for choosing us!',
    },
    {
      type: 'button',
      text: 'Click here',
      parameters: [
        {
          type: 'text',
          text: 'https://example.com',
        },
      ],
    },
  ],
);
```

#### Template Management

##### Get Templates

```typescript
const templates = await whatsapp.getTemplates({
  limit: 10,
  offset: 0,
});
```

##### Create Template

```typescript
await whatsapp.createTemplate({
  name: 'template_name',
  category: 'MARKETING',
  language: 'en',
  components: [
    {
      type: 'BODY',
      text: 'Hello {{1}}!',
      example: {
        body_text: [['John']],
      },
    },
  ],
});
```

##### Delete Template

```typescript
await whatsapp.deleteTemplate('template_name');
```

## Message Management

### Mark Message as Read

```typescript
await whatsapp.markMessageAsRead('MESSAGE_ID');
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

## Phone Number Management

### Register Phone Number

```typescript
await whatsapp.registerPhone('PHONE_NUMBER', 'PIN_CODE');
```

### Deregister Phone Number

```typescript
await whatsapp.deregisterPhone('PHONE_NUMBER');
```

### Get Phone Numbers

```typescript
const phoneNumbers = await whatsapp.getPhoneNumbers();
```

### Get QR Code

```typescript
const qrCode = await whatsapp.getQRCode();
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

## Analytics

### Get Analytics

```typescript
const analytics = await whatsapp.getAnalytics({
  start: '2024-01-01',
  end: '2024-01-31',
  granularity: 'DAY', // 'DAY' | 'HOUR' | 'MONTH'
});
```

## Commerce Settings

### Get Commerce Settings

```typescript
const settings = await whatsapp.getCommerceSettings();
```

### Update Commerce Settings

```typescript
await whatsapp.updateCommerceSettings({
  // Commerce settings data
});
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
