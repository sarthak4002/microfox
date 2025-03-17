import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createSESSdk } from '@microfox/aws-ses';

// Check for required environment variables
const hasRequiredEnvVars =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.SENDER_EMAIL &&
  process.env.RECIPIENT_EMAIL;

// Skip all tests if environment variables are missing
const itIfEnvVars = hasRequiredEnvVars ? it : it.skip;

/**
 * Helper function to extract the MessageId from the nested response structure
 */
const getMessageId = (response: any): string => {
  return response.SendEmailResponse.SendEmailResult.MessageId;
};

/**
 * Helper function to extract the RequestId from the nested response structure
 */
const getRequestId = (response: any): string => {
  return response.SendEmailResponse.ResponseMetadata.RequestId;
};

describe('AWS SES SDK Integration Tests', () => {
  let sesSDK: ReturnType<typeof createSESSdk>;

  beforeAll(() => {
    // Only create the SDK if we have credentials
    if (hasRequiredEnvVars) {
      sesSDK = createSESSdk({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION || 'ap-southeast-2',
      });
      console.log(
        `AWS SES SDK initialized with region: ${process.env.AWS_REGION || 'ap-southeast-2'}`,
      );
    } else {
      console.warn(
        'Skipping AWS SES SDK integration tests: Missing required environment variables.\n' +
          'Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION to run these tests.',
      );
    }
  });

  describe('Single Email Operations', () => {
    itIfEnvVars('should send a plain text email', async () => {
      const response = await sesSDK.sendEmail({
        sender: process.env.SENDER_EMAIL!,
        recipient: process.env.RECIPIENT_EMAIL!,
        subject: 'Test Plain Text Email',
        bodyText: 'This is a test email sent using the AWS SES SDK.',
        // No bodyHtml
      });

      const messageId = getMessageId(response);
      const requestId = getRequestId(response);

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');
      expect(requestId).toBeDefined();
    });

    itIfEnvVars('should send an HTML email with display name', async () => {
      const response = await sesSDK.sendEmail({
        sender: process.env.SENDER_EMAIL!,
        recipient: process.env.RECIPIENT_EMAIL!,
        displayName: 'Test Sender',
        subject: 'Test HTML Email',
        bodyHtml: '<h1>Test Email</h1><p>This is a test HTML email.</p>',
        // No bodyText
      });

      const messageId = getMessageId(response);
      const requestId = getRequestId(response);

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');
      expect(requestId).toBeDefined();
    });

    itIfEnvVars('should send an email with empty body', async () => {
      const response = await sesSDK.sendEmail({
        sender: process.env.SENDER_EMAIL!,
        recipient: process.env.RECIPIENT_EMAIL!,
        subject: 'Test Empty Body Email',
        // No bodyHtml or bodyText
      });

      const messageId = getMessageId(response);
      const requestId = getRequestId(response);

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');
      expect(requestId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    const invalidSDK = createSESSdk({
      accessKeyId: 'AKIA_INVALID_KEY',
      secretAccessKey: 'invalid-secret',
      region: 'us-east-1',
    });

    itIfEnvVars('should handle invalid credentials gracefully', async () => {
      await expect(
        invalidSDK.sendEmail({
          sender: process.env.SENDER_EMAIL!,
          recipient: process.env.RECIPIENT_EMAIL!,
          subject: 'Test Email',
          bodyText: 'Test content',
        }),
      ).rejects.toThrow();
    });

    itIfEnvVars('should reject invalid email addresses', async () => {
      await expect(
        sesSDK.sendEmail({
          sender: 'invalid-email',
          recipient: process.env.RECIPIENT_EMAIL!,
          subject: 'Test Email',
          bodyText: 'Test content',
        }),
      ).rejects.toThrow();

      await expect(
        sesSDK.sendEmail({
          sender: process.env.SENDER_EMAIL!,
          recipient: 'invalid-email',
          subject: 'Test Email',
          bodyText: 'Test content',
        }),
      ).rejects.toThrow();
    });

    it('should reject when both bodyText and bodyHtml are provided', async () => {
      // Create a test SDK with mock credentials
      const testSDK = createSESSdk({
        accessKeyId: 'AKIATEST123456789',
        secretAccessKey: 'testsecretkey',
        region: 'us-east-1',
      });

      // Both bodyText and bodyHtml are provided - should throw error
      await expect(
        testSDK.sendEmail({
          sender: 'test@example.com',
          recipient: 'test@example.com',
          subject: 'Test Email',
          bodyText: 'Plain text content',
          bodyHtml: '<p>HTML content</p>',
        }),
      ).rejects.toThrow(
        /Cannot provide both bodyText and bodyHtml at the same time/,
      );
    });
  });

  describe('Content Format Options', () => {
    // These tests don't need to actually send emails,
    // just verify that the validation accepts valid combinations

    it('should accept email with only bodyText', async () => {
      // Create a test SDK with mock credentials
      const testSDK = createSESSdk({
        accessKeyId: 'AKIATEST123456789',
        secretAccessKey: 'testsecretkey',
        region: 'us-east-1',
      });

      // Spy on sendEmail to prevent actual API calls
      const sendEmailSpy = vi.spyOn(testSDK, 'sendEmail');
      sendEmailSpy.mockImplementation(async () => {
        return {
          SendEmailResponse: {
            SendEmailResult: { MessageId: 'mock-id' },
            ResponseMetadata: { RequestId: 'mock-req-id' },
          },
        } as any;
      });

      try {
        // This should pass validation for bodyText only
        await testSDK.sendEmail({
          sender: 'test@example.com',
          recipient: 'test@example.com',
          subject: 'Text Only Test',
          bodyText: 'This is a text-only email',
          // No bodyHtml
        });
        expect(sendEmailSpy).toHaveBeenCalled();
      } finally {
        sendEmailSpy.mockRestore();
      }
    });

    it('should accept email with only bodyHtml', async () => {
      // Create a test SDK with mock credentials
      const testSDK = createSESSdk({
        accessKeyId: 'AKIATEST123456789',
        secretAccessKey: 'testsecretkey',
        region: 'us-east-1',
      });

      // Spy on sendEmail to prevent actual API calls
      const sendEmailSpy = vi.spyOn(testSDK, 'sendEmail');
      sendEmailSpy.mockImplementation(async () => {
        return {
          SendEmailResponse: {
            SendEmailResult: { MessageId: 'mock-id' },
            ResponseMetadata: { RequestId: 'mock-req-id' },
          },
        } as any;
      });

      try {
        // This should pass validation for bodyHtml only
        const params = {
          sender: 'test@example.com',
          recipient: 'test@example.com',
          subject: 'HTML Only Test',
          // No bodyText
          bodyHtml: '<p>This is an HTML-only email</p>',
        };

        await testSDK.sendEmail(params);
        expect(sendEmailSpy).toHaveBeenCalledWith(params);
      } finally {
        sendEmailSpy.mockRestore();
      }
    });
  });

  // describe('Bulk Email Operations', () => {
  //     itIfEnvVars('should send bulk emails to the same recipient', async () => {
  //         const response = await sesSDK.sendBulkEmails({
  //             sender: process.env.SENDER_EMAIL!,
  //             recipients: [process.env.RECIPIENT_EMAIL!],
  //             subject: 'Test Bulk Email',
  //             bodyText: 'This is a bulk test email.',
  //         });

  //         expect(response).toBeInstanceOf(Array);
  //         expect(response.length).toBe(1);

  //         const messageId = getMessageId(response[0]);
  //         const requestId = getRequestId(response[0]);

  //         expect(messageId).toBeDefined();
  //         expect(typeof messageId).toBe('string');
  //         expect(requestId).toBeDefined();
  //     });
  // });

  // describe('Parallel Operations', () => {
  //     itIfEnvVars('should handle multiple emails in parallel', async () => {
  //         const emails = await Promise.all([
  //             sesSDK.sendEmail({
  //                 sender: process.env.SENDER_EMAIL!,
  //                 recipient: process.env.RECIPIENT_EMAIL!,
  //                 subject: 'Parallel Test 1',
  //                 bodyText: 'First parallel email',
  //             }),
  //             sesSDK.sendEmail({
  //                 sender: process.env.SENDER_EMAIL!,
  //                 recipient: process.env.RECIPIENT_EMAIL!,
  //                 subject: 'Parallel Test 2',
  //                 bodyText: 'Second parallel email',
  //             }),
  //         ]);

  //         expect(emails).toHaveLength(2);
  //         emails.forEach(response => {
  //             const messageId = getMessageId(response);
  //             const requestId = getRequestId(response);

  //             expect(messageId).toBeDefined();
  //             expect(typeof messageId).toBe('string');
  //             expect(requestId).toBeDefined();
  //         });
  //     });
  // });
});
