# Microfox REST SDK

A powerful, type-safe HTTP client for TypeScript applications with support for multiple response types, retry mechanisms, and extensive configuration options.

## Features

- 🚀 Full TypeScript support with type inference
- 🔄 Configurable retry mechanism
- 📝 Multiple content type support (JSON, FormData, URL-encoded, etc.)
- 🎯 Chainable response methods
- ⚡ Automatic timeout handling
- 🛡️ Comprehensive error handling
- 🔍 Request/Response interceptors
- 📦 Zero dependencies (except for Zod)

## Installation

```bash
npm install @microfox/rest-sdk
# or
yarn add @microfox/rest-sdk
```

## Quick Start

```typescript
import { createRestSDK } from '@microfox/rest-sdk';

// Create SDK instance
const api = createRestSDK({
  baseUrl: 'https://api.example.com',
});

// Make requests
const data = await api.get('/users').json();
```

## Basic Usage

### Making Requests

```typescript
// GET request
const users = await api.get('/users').json();

// POST request with JSON body
const newUser = await api
  .post('/users', {
    name: 'John Doe',
    email: 'john@example.com',
  })
  .json();

// PUT request
const updated = await api
  .put('/users/1', {
    name: 'Jane Doe',
  })
  .json();

// DELETE request
await api.delete('/users/1').json();
```

### Response Types

```typescript
// JSON response
const jsonData = await api.get('/data').json();

// Text response
const textData = await api.get('/text').text();

// Binary data
const binaryData = await api.get('/file').blob();

// Form data
const formData = await api.get('/form').formData();

// Access headers
const headers = await api.get('/data').headers();

// Get raw response
const response = await api.get('/data').raw();
```

### Request Options

```typescript
const response = await api
  .get('/users', {
    // Query parameters
    query: {
      page: 1,
      limit: 10,
      filter: ['active', 'verified'],
    },

    // Custom headers
    headers: {
      'X-Custom-Header': 'value',
    },

    // Content type
    contentType: 'application/json',

    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 2,
    },

    // Request configuration
    cache: 'no-cache',
    credentials: 'include',
    mode: 'cors',
  })
  .json();
```

### Different Content Types

```typescript
// Form Data
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('name', 'test.txt');

const uploadResult = await api
  .post('/upload', formData, {
    contentType: 'multipart/form-data',
  })
  .json();

// URL-encoded form
const formResult = await api
  .post(
    '/submit',
    {
      key: 'value',
    },
    {
      contentType: 'application/x-www-form-urlencoded',
    },
  )
  .json();

// Binary data
const binaryResult = await api
  .post('/binary', binaryBlob, {
    contentType: 'application/octet-stream',
  })
  .json();
```

### Error Handling

```typescript
try {
  const data = await api.get('/data').json();
} catch (error) {
  if (APICallError.isInstance(error)) {
    // Handle API errors (4xx, 5xx)
    console.error('API Error:', {
      message: error.message,
      statusCode: error.statusCode,
      url: error.url,
    });
  } else if (MicrofoxSDKError.isInstance(error)) {
    // Handle SDK-specific errors
    console.error('SDK Error:', {
      name: error.name,
      message: error.message,
    });
  } else {
    // Handle other errors
    console.error('Unknown error:', error);
  }
}
```

### TypeScript Support

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUser {
  name: string;
  email: string;
}

// Type-safe requests
const user = await api.get<User>('/users/1').json();
const newUser = await api
  .post<User, CreateUser>('/users', {
    name: 'John',
    email: 'john@example.com',
  })
  .json();
```

## Advanced Configuration

### Creating Authenticated Clients

```typescript
const authenticatedApi = createRestSDK({
  baseUrl: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});
```

### Environment-Specific Configuration

```typescript
const createApiClient = (environment: 'development' | 'production') => {
  const config = {
    development: {
      baseUrl: 'https://dev-api.example.com',
      timeout: 10000,
    },
    production: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
    },
  };

  return createRestSDK(config[environment]);
};
```

## Error Types

### APICallError

Thrown when the server returns a non-2xx status code.

Properties:

- `message`: Error message
- `statusCode`: HTTP status code
- `url`: Request URL
- `responseHeaders`: Response headers
- `requestBodyValues`: Request body (if any)

### MicrofoxSDKError

Thrown for SDK-specific errors (timeout, invalid response type, etc.).

Properties:

- `name`: Error name
- `message`: Error message

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
