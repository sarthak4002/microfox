import { createSESSdk } from '@microfox/aws-ses';

// Helper function to safely extract the MessageId from the response
const getMessageId = (response: any): string => {
  return response?.SendEmailResponse?.SendEmailResult?.MessageId || 'Unknown';
};

// Initialize the SDK with AWS credentials
const createSESClient = (config: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}) => {
  return createSESSdk({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });
};

// Example of sending different types of emails
async function sesSDKExamples() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? '';
  const region = process.env.AWS_REGION ?? 'ap-southeast-2';
  const senderEmail = process.env.SENDER_EMAIL ?? '';
  const recipientEmail = process.env.RECIPIENT_EMAIL ?? '';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials are required. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.',
    );
  }
  if (!senderEmail || !recipientEmail) {
    throw new Error(
      'SENDER_EMAIL and RECIPIENT_EMAIL environment variables are required.',
    );
  }

  console.log('Using AWS region:', region);
  const sesSDK = createSESClient({ accessKeyId, secretAccessKey, region });

  try {
    console.log('\n1. Sending plain text email...');
    // Basic plain text email - only bodyText
    const plainTextEmail = await sesSDK.sendEmail({
      sender: senderEmail,
      recipient: recipientEmail,
      subject: 'Plain Text Email from AWS SES SDK 📧',
      bodyText:
        'This is a plain text email sent using the AWS SES SDK. No HTML content included.',
      // No bodyHtml - should work fine with just bodyText
    });
    console.log('✅ Plain text email sent!');
    console.log('Message ID:', getMessageId(plainTextEmail));

    console.log('\n2. Sending HTML email...');
    // HTML email with display name - only bodyHtml
    const htmlEmail = await sesSDK.sendEmail({
      sender: senderEmail,
      recipient: recipientEmail,
      displayName: 'AWS SES SDK Example',
      subject: 'HTML Email from AWS SES SDK 🎨',
      // No bodyText - should work fine with just bodyHtml
      bodyHtml: `
        <h1>HTML Email Test</h1>
        <p>This email only has HTML content, with no plain text alternative.</p>
        <ul>
          <li>This demonstrates that bodyHtml works on its own</li>
          <li>The email should display properly in HTML-capable email clients</li>
        </ul>
      `,
    });
    console.log('✅ HTML-only email sent!');
    console.log('Message ID:', getMessageId(htmlEmail));

    console.log('\n4. Testing validation error...');
    try {
      // This should fail - both bodyText and bodyHtml provided
      await sesSDK.sendEmail({
        sender: senderEmail,
        recipient: recipientEmail,
        subject: 'This email will fail',
        bodyText: 'Plain text content',
        bodyHtml: '<p>HTML content</p>',
      });
      console.log(
        '❌ Error: Email with both body formats was accepted (should not happen)',
      );
    } catch (error) {
      console.log(
        '✅ Validation correctly prevented sending email with both body formats',
      );
      console.log(
        `Error message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Bulk email example (commented out for now)
    const bulkEmailResult = await sesSDK.sendBulkEmails({
      sender: senderEmail,
      recipients: [recipientEmail],
      displayName: 'AWS SES SDK Bulk Example',
      subject: 'Bulk Email Test',
      bodyText: 'This is a test of the bulk email functionality.',
      // Only use one of bodyText or bodyHtml, not both
      // bodyHtml: '<h1>Bulk Email Test</h1><p>This is a test of the bulk email functionality.</p>'
    });
    console.log('Bulk email sent:', bulkEmailResult);
    if (bulkEmailResult.length > 0) {
      console.log('First Message ID:', getMessageId(bulkEmailResult[0]));
    }
  } catch (error) {
    console.error('\n❌ Error in SES SDK examples:', error);
    throw error;
  }
}

// Example with environment-specific configuration
const createProductionClient = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are required for production');
  }

  return createSESClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION ?? 'ap-southeast-2',
  });
};

// Only run examples if this file is executed directly
if (require.main === module) {
  sesSDKExamples()
    .then(() => console.log('SES SDK examples completed successfully'))
    .catch(err => {
      console.error('SES SDK examples failed:', err);
      process.exit(1);
    });
}

export { sesSDKExamples, createSESClient, createProductionClient };
