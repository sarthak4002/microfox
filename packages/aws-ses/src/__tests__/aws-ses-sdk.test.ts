import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { createSESSdk, EmailParams } from '../aws-ses-sdk';

// Spy on console.error to prevent showing errors during tests
const originalConsoleError = console.error;
console.error = vi.fn();

// Mock the crypto module used for AWS signature generation
vi.mock('crypto', () => {
  return {
    default: {
      createHmac: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          digest: vi.fn().mockReturnValue(Buffer.from('mocked-digest')),
        }),
      }),
      createHash: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          digest: vi.fn().mockReturnValue('mocked-hash'),
        }),
      }),
    },
  };
});

describe('AWS SES SDK (No credentials required)', () => {
  // Mock AWS credentials - these are not real and won't be used for actual API calls
  const mockConfig = {
    accessKeyId: 'TEST_KEY_ID',
    secretAccessKey: 'TEST_SECRET_KEY',
    region: 'test-region-1',
  };

  // Mock email parameters
  const mockEmailParams: EmailParams = {
    sender: 'sender@example.com',
    recipient: 'recipient@example.com',
    subject: 'Test Email',
    bodyText: 'Test body plain text',
  };

  const mockBulkEmailParams = {
    sender: 'sender@example.com',
    recipients: ['recipient1@example.com', 'recipient2@example.com'],
    subject: 'Test Email',
    bodyText: 'Test body plain text',
  };

  let sesSdk: ReturnType<typeof createSESSdk>;
  let restSdkModule: any;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Import the mocked module to access it in the tests
    restSdkModule = await import('@microfox/rest-sdk');

    // Create a new SDK instance for each test
    sesSdk = createSESSdk(mockConfig);
  });

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('SDK Initialization', () => {
    it('should successfully create an SDK instance with mock credentials', () => {
      expect(sesSdk).toBeDefined();
      expect(typeof sesSdk.sendEmail).toBe('function');
      expect(typeof sesSdk.sendBulkEmails).toBe('function');
    });

    it('should validate AWS configuration', () => {
      // Test with invalid config
      expect(() =>
        createSESSdk({
          accessKeyId: '', // Empty string is invalid
          secretAccessKey: 'test',
          region: 'test',
        }),
      ).toThrow();
    });
  });

  describe('sendEmail', () => {
    it('should reject invalid email parameters with Zod validation', async () => {
      // Intentionally using invalid parameters to trigger Zod validation
      await expect(
        sesSdk.sendEmail({
          sender: 'invalid-email',
          recipient: 'recipient@example.com',
          subject: 'Test',
        } as any),
      ).rejects.toThrow();
    });
  });

  describe('sendBulkEmails', () => {
    it('should reject bulk email with empty recipients array', async () => {
      await expect(
        sesSdk.sendBulkEmails({
          ...mockBulkEmailParams,
          recipients: [],
        }),
      ).rejects.toThrow();
    });
  });
});
