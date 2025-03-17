# AWS SES SDK Example

This example demonstrates how to use the `@microfox/aws-ses` package to send emails using AWS SES.

## Prerequisites

1. AWS account with SES configured
2. Verified email addresses (both sender and recipient)
3. AWS credentials with appropriate IAM permissions

## Examples:
```typescript
// Valid: Plain text email
await sesSdk.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'Plain Text Email',
  bodyText: 'This is a plain text email'
});

// Valid: HTML email
await sesSdk.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'HTML Email',
  bodyHtml: '<p>This is an HTML email</p>'
});

```

## Running Integration Tests

To run the full integration test suite:

```bash
npm test
```

These tests will automatically skip if AWS credentials are not available in your environment variables. Tests requiring actual email sending use the real AWS credentials, while validation tests use mock credentials to avoid unnecessary API calls.
