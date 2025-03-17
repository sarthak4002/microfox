# AWS SES SDK Example

This example demonstrates how to use the `@microfox/aws-ses` package to send emails using AWS SES.

## Prerequisites

1. AWS account with SES configured
2. Verified email addresses (both sender and recipient)
3. AWS credentials with appropriate IAM permissions:
   - `ses:SendEmail` - For sending single emails
   - `ses:SendRawEmail` - For sending raw emails
   - `ses:SendBulkTemplatedEmail` - For sending bulk emails
   - `ses:SendTemplatedEmail` - For sending templated emails

   Example IAM policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail",
           "ses:SendBulkTemplatedEmail",
           "ses:SendTemplatedEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## Email Content Validation Rules

The AWS SES SDK enforces strict validation rules for email body content:

1. You MUST provide **exactly one** of the following:
   - `bodyText` (plain text email)
   - `bodyHtml` (HTML email)
   - No body content (empty email)
2. The SDK will throw a validation error if:
   - Both `bodyText` AND `bodyHtml` are provided simultaneously
   - Invalid email addresses are used
   - Required fields are missing

Examples:
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

// Valid: Empty email (no body content)
await sesSdk.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'Empty Email'
});

// Invalid: Will throw validation error
await sesSdk.sendEmail({
  sender: 'sender@example.com',
  recipient: 'recipient@example.com',
  subject: 'Invalid Email',
  bodyText: 'Plain text content',
  bodyHtml: '<p>HTML content</p>'  // Cannot provide both!
});
```

## Running Integration Tests

To run the full integration test suite:

```bash
npm test
```

These tests will automatically skip if AWS credentials are not available in your environment variables. Tests requiring actual email sending use the real AWS credentials, while validation tests use mock credentials to avoid unnecessary API calls.

## Email Constants

This example uses the following email addresses:
- Sender: `tmd@reply-bots.com`
- Recipient: `vishwajeety14122@gmail.com`

If you need to change these, update them in `src/index.ts`.
