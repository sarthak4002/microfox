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
- ••• Typing indicator support
- 🔄 Message reactions and contextual replies
- 📍 Location sharing
- 👥 Contact sharing
- 🔄 Interactive messages (buttons, lists, flows)
- 📱 QR code generation

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
// Basic text message
await whatsapp.sendTextMessage(
  'RECIPIENT_PHONE_NUMBER',
  'Hello from WhatsApp Business API!',
  'individual', // Optional: recipient type (individual or group)
);

// Text message with preview URL
await whatsapp.sendTextMessage(
  'RECIPIENT_PHONE_NUMBER',
  'Check out our website: https://example.com',
  'individual',
);
```

### Media Messages

#### Image

```typescript
// Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'image');
await whatsapp.sendImageMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    id: mediaId,
    caption: 'This is an image caption',
  },
  'individual',
);

// Using Direct Link (Alternative)
await whatsapp.sendImageMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    link: 'https://example.com/image.jpg',
    caption: 'This is an image caption',
  },
  'individual',
);
```

#### Video

```typescript
// Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'video');
await whatsapp.sendVideoMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    id: mediaId,
    caption: 'This is a video caption',
  },
  'individual',
);

// Using Direct Link (Alternative)
await whatsapp.sendVideoMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    link: 'https://example.com/video.mp4',
    caption: 'This is a video caption',
  },
  'individual',
);
```

#### Document

```typescript
// Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'document');
await whatsapp.sendDocumentMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    id: mediaId,
    filename: 'document.pdf',
    caption: 'This is a document caption',
  },
  'individual',
);

// Using Direct Link (Alternative)
await whatsapp.sendDocumentMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    link: 'https://example.com/document.pdf',
    filename: 'document.pdf',
    caption: 'This is a document caption',
  },
  'individual',
);
```

#### Audio

```typescript
// Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'audio');
await whatsapp.sendAudioMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    id: mediaId,
  },
  'individual',
);

// Using Direct Link (Alternative)
await whatsapp.sendAudioMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    link: 'https://example.com/audio.mp3',
  },
  'individual',
);
```

#### Sticker

```typescript
// Using Media ID (Recommended)
const mediaId = await whatsapp.uploadMedia(file, 'sticker');
await whatsapp.sendStickerMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    id: mediaId,
  },
  'individual',
);

// Using Direct Link (Alternative)
await whatsapp.sendStickerMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    link: 'https://example.com/sticker.webp',
  },
  'individual',
);
```

### Location Messages

```typescript
// Basic location
await whatsapp.sendLocationMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    longitude: 123.456,
    latitude: 78.901,
  },
  'individual',
);

// Location with name and address
await whatsapp.sendLocationMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    longitude: 123.456,
    latitude: 78.901,
    name: 'Business Location',
    address: '123 Business Street, City, Country',
  },
  'individual',
);
```

### Contact Messages

```typescript
// Single contact
await whatsapp.sendContactMessage(
  'RECIPIENT_PHONE_NUMBER',
  [
    {
      name: {
        formatted_name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
      },
      phones: [
        {
          phone: '+1234567890',
          type: 'WORK',
        },
      ],
    },
  ],
  'individual',
);

// Multiple contacts
await whatsapp.sendContactMessage(
  'RECIPIENT_PHONE_NUMBER',
  [
    {
      name: {
        formatted_name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
      },
      phones: [
        {
          phone: '+1234567890',
          type: 'WORK',
        },
      ],
    },
    {
      name: {
        formatted_name: 'Jane Smith',
        first_name: 'Jane',
        last_name: 'Smith',
      },
      phones: [
        {
          phone: '+0987654321',
          type: 'CELL',
        },
      ],
    },
  ],
  'individual',
);
```

### Interactive Messages

#### Buttons

```typescript
// Simple buttons
await whatsapp.sendInteractiveMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    type: 'button',
    body: {
      text: 'Choose an option',
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'option1',
            title: 'Option 1',
          },
        },
        {
          type: 'reply',
          reply: {
            id: 'option2',
            title: 'Option 2',
          },
        },
      ],
    },
  },
  'individual',
);

// Buttons with emojis
await whatsapp.sendInteractiveMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    type: 'button',
    body: {
      text: 'How can we help you?',
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'support',
            title: '💬 Support',
          },
        },
        {
          type: 'reply',
          reply: {
            id: 'sales',
            title: '💰 Sales',
          },
        },
      ],
    },
  },
  'individual',
);
```

#### Lists

```typescript
// Simple list
await whatsapp.sendInteractiveMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    type: 'list',
    body: {
      text: 'Choose a category',
    },
    action: {
      button: 'Select',
      sections: [
        {
          title: 'Products',
          rows: [
            {
              id: 'product1',
              title: 'Product 1',
              description: 'Description of product 1',
            },
            {
              id: 'product2',
              title: 'Product 2',
              description: 'Description of product 2',
            },
          ],
        },
      ],
    },
  },
  'individual',
);

// Multiple sections list
await whatsapp.sendInteractiveMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    type: 'list',
    body: {
      text: 'Select a service',
    },
    action: {
      button: 'Choose',
      sections: [
        {
          title: 'Support',
          rows: [
            {
              id: 'support_chat',
              title: 'Chat Support',
              description: '24/7 chat support',
            },
            {
              id: 'support_email',
              title: 'Email Support',
              description: 'Email support team',
            },
          ],
        },
        {
          title: 'Sales',
          rows: [
            {
              id: 'sales_contact',
              title: 'Contact Sales',
              description: 'Talk to our sales team',
            },
            {
              id: 'sales_demo',
              title: 'Request Demo',
              description: 'Schedule a product demo',
            },
          ],
        },
      ],
    },
  },
  'individual',
);
```

### Template Messages

```typescript
// Simple template
await whatsapp.sendTemplateMessage(
  'RECIPIENT_PHONE_NUMBER',
  'hello_world',
  'en_US',
  [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: 'John',
        },
      ],
    },
  ],
  'individual',
);

// Template with multiple components
await whatsapp.sendTemplateMessage(
  'RECIPIENT_PHONE_NUMBER',
  'order_confirmation',
  'en_US',
  [
    {
      type: 'header',
      parameters: [
        {
          type: 'text',
          text: 'Order #12345',
        },
      ],
    },
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: 'John',
        },
        {
          type: 'text',
          text: '2 items',
        },
        {
          type: 'text',
          text: '$99.99',
        },
      ],
    },
    {
      type: 'footer',
      text: 'Thank you for your order!',
    },
  ],
  'individual',
);
```

### Flow Messages

```typescript
// Simple flow
await whatsapp.sendFlowMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    token: 'flow_token',
    parameters: {
      product_id: '123',
      user_id: '456',
    },
  },
  'individual',
);

// Flow with header and body
await whatsapp.sendFlowMessage(
  'RECIPIENT_PHONE_NUMBER',
  {
    token: 'flow_token',
    header: {
      type: 'text',
      text: 'Welcome to our service!',
    },
    body: {
      text: 'Please complete the following steps:',
    },
    parameters: {
      flow_id: '789',
      step: '1',
    },
  },
  'individual',
);
```

### Message Reactions

```typescript
// Simple reaction
await whatsapp.sendReaction('RECIPIENT_PHONE_NUMBER', 'message_id', '👍');

// Multiple reactions
await whatsapp.sendReaction('RECIPIENT_PHONE_NUMBER', 'message_id', '❤️');
```

### Message Replies

```typescript
// Text reply
await whatsapp.sendReply(
  'RECIPIENT_PHONE_NUMBER',
  'text',
  'Thank you for your message!',
  'message_id',
  'individual',
);

// Media reply
await whatsapp.sendReply(
  'RECIPIENT_PHONE_NUMBER',
  'image',
  {
    id: 'MEDIA_ID',
    caption: 'Here is the image you requested',
  },
  'message_id',
  'individual',
);
```

### Message Management

```typescript
// Mark single message as read
await whatsapp.markMessageAsRead('MESSAGE_ID');

// Mark multiple messages as read
await whatsapp.markMessagesAsRead(['MESSAGE_ID_1', 'MESSAGE_ID_2']);
```

### Media Management

```typescript
// Upload media
const mediaId = await whatsapp.uploadMedia(file, 'image');

// Download media
const mediaData = await whatsapp.downloadMedia('MEDIA_ID');

// Get media URL
const mediaUrl = await whatsapp.getMediaUrl('MEDIA_ID');
```

### Phone Number Management

```typescript
// Register phone
await whatsapp.registerPhone('PHONE_NUMBER', 'PIN');

// Deregister phone
await whatsapp.deregisterPhone('PHONE_NUMBER');

// Get phone numbers
const phoneNumbers = await whatsapp.getPhoneNumbers();

// Get QR code
const qrCode = await whatsapp.getQRCode();
```

### Business Profile

```typescript
// Get business profile
const profile = await whatsapp.getBusinessProfile();

// Update business profile
const updatedProfile = await whatsapp.updateBusinessProfile({
  about: 'We provide excellent customer service',
  address: '123 Business Street, City, Country',
  description: 'Leading provider of business solutions',
  email: 'contact@business.com',
  website: 'https://business.com',
});
```

### Analytics

```typescript
// Get daily analytics
const analytics = await whatsapp.getAnalytics({
  start: '2024-01-01',
  end: '2024-01-31',
  granularity: 'DAY',
});

// Get hourly analytics
const hourlyAnalytics = await whatsapp.getAnalytics({
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-01T23:59:59Z',
  granularity: 'HOUR',
});
```

### Commerce Settings

```typescript
// Get commerce settings
const settings = await whatsapp.getCommerceSettings();

// Update commerce settings
const updatedSettings = await whatsapp.updateCommerceSettings({
  catalog_id: 'CATALOG_ID',
  is_catalog_visible: true,
  cart_enabled: true,
  cart_expiration_time: 3600,
});
```

## Error Handling

The SDK throws a `WhatsAppBusinessSDKError` for API errors with the following properties:

```typescript
class WhatsAppBusinessSDKError extends Error {
  code: number;
  originalError: any;
}
```

Example error handling:

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
