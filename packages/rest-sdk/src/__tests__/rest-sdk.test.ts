import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APICallError, MicrofoxSDKError } from '../errors';
import { createRestSDK } from '../rest-sdk';

describe('REST SDK', () => {
  // Mock fetch globally
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  const sdk = createRestSDK({
    baseUrl: 'https://api.test.com',
  });

  describe('Request Methods', () => {
    it('should make GET request with JSON response', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await sdk.get('/test').json();
      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should make POST request with body', async () => {
      const requestBody = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 1, ...requestBody }),
      });

      const response = await sdk.post('/test', requestBody).json();
      expect(response).toEqual({ id: 1, ...requestBody });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        }),
      );
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });

      await sdk
        .get('/test', {
          query: { page: 1, filter: 'active' },
        })
        .json();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test?page=1&filter=active',
        expect.any(Object),
      );
    });
  });

  describe('Content Types', () => {
    it('should handle form data', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });

      await sdk
        .post('/upload', formData, {
          contentType: 'multipart/form-data',
        })
        .json();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    it('should handle URL-encoded data', async () => {
      const data = { key: 'value' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });

      await sdk
        .post('/form', data, {
          contentType: 'application/x-www-form-urlencoded',
        })
        .json();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/form',
        expect.objectContaining({
          method: 'POST',
          body: 'key=value',
        }),
      );
    });
  });

  describe('Response Types', () => {
    it('should handle text response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('Hello World'),
      });

      const response = await sdk.get('/test').text();
      expect(response).toBe('Hello World');
    });

    it('should handle blob response', async () => {
      const mockBlob = new Blob(['test']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        blob: () => Promise.resolve(mockBlob),
      });

      const response = await sdk.get('/test').blob();
      expect(response).toEqual(mockBlob);
    });

    it('should provide access to headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'x-custom': 'value' }),
      });

      const headers = await sdk.get('/test').headers();
      expect(headers['x-custom']).toBe('value');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
      });

      await expect(sdk.get('/nonexistent').json()).rejects.toThrow(
        APICallError,
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(sdk.get('/test').json()).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(sdk.get('/test').json()).rejects.toThrow();
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry on server errors', async () => {
      const mockSuccess = { success: true };
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(mockSuccess),
        });

      const response = await sdk
        .get('/test', {
          retry: {
            attempts: 2,
            delay: 100,
            backoff: 2,
          },
        })
        .json();

      expect(response).toEqual(mockSuccess);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should respect max retry attempts', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: new Headers(),
      });

      await expect(
        sdk
          .get('/test', {
            retry: {
              attempts: 3,
              delay: 100,
              backoff: 2,
            },
          })
          .json(),
      ).rejects.toThrow();

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout', async () => {
      // Mock AbortError
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError',
      );

      // Make fetch throw AbortError when aborted
      mockFetch.mockImplementationOnce(() => {
        throw abortError;
      });

      const sdkWithTimeout = createRestSDK({
        baseUrl: 'https://api.test.com',
        timeout: 100,
      });

      await expect(sdkWithTimeout.get('/test').json()).rejects.toThrow(
        MicrofoxSDKError,
      );
    });
  });
});
