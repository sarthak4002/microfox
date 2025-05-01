## Function: `sendBulkEmails`

Sends multiple emails in parallel using the provided parameters.

**Purpose:**

This function sends multiple emails to a list of recipients using the AWS SES service. Emails are sent in parallel for improved performance.

**Parameters:**

- `params`: BulkEmailParams - Required. Parameters for sending bulk emails.

  - `sender`: string - Required. Email address of the sender (must be verified in AWS SES). This is a string value in email format.
  - `recipients`: array<string> - Required. List of recipient email addresses. This is an array of strings, each in email format.
  - `displayName`: string | undefined - Optional. Display name for the sender (e.g., "John Doe" <john@example.com>). This is a string value.
  - `subject`: string - Required. Subject line of the email. This is a string value.
  - `bodyText`: string | undefined - Optional. Plain text version of the email body. This is a string value.
  - `bodyHtml`: string | undefined - Optional. HTML version of the email body. This is a string value.

**Return Value:**

- `Promise<SendEmailResponse[]>` - A promise that resolves to an array of SendEmailResponse objects, one for each recipient.

  - `SendEmailResponse`: array<object> - An array of responses from the AWS SES API.

    - `SendEmailResult`: object - The result of the SendEmail operation.

      - `MessageId`: string - The unique identifier for the sent email. This is a string value.

    - `ResponseMetadata`: object - Metadata about the AWS SES API request.

      - `RequestId`: string - The unique request identifier. This is a string value.

**Examples:**

```typescript
// Example: Sending bulk emails
const responses = await ses.sendBulkEmails({
  sender: 'sender@example.com',
  recipients: ['recipient1@example.com', 'recipient2@example.com'],
  subject: 'Hello from SES!',
  bodyText: 'This is a plain text email body.',
});

console.log(responses);
```
