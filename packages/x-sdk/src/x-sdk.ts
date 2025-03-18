import { z } from 'zod';
import crypto from 'crypto';
import https, { RequestOptions } from 'https';

// User Schema
export const UserSchema = z
  .object({
    id: z.string().describe('Unique identifier of this User.'),
    name: z.string().describe('The name of the user.'),
    username: z.string().describe('The username/handle of the user.'),
    created_at: z
      .string()
      .optional()
      .describe('The UTC datetime that the user account was created.'),
    protected: z
      .boolean()
      .optional()
      .describe('Indicates if this user has chosen to protect their Tweets.'),
    profile_image_url: z
      .string()
      .optional()
      .describe('URL to the profile image for this user.'),
    description: z
      .string()
      .optional()
      .describe('The user-defined UTF-8 string describing their account.'),
    location: z
      .string()
      .optional()
      .describe("The user-defined location for this account's profile."),
    url: z
      .string()
      .optional()
      .describe("The URL specified in the user's profile."),
    verified: z
      .boolean()
      .optional()
      .describe('Indicates if this user is verified.'),
    verified_type: z
      .string()
      .optional()
      .describe('The type of verification the user has.'),
    public_metrics: z
      .object({
        followers_count: z
          .number()
          .optional()
          .describe('Number of users who follow this user.'),
        following_count: z
          .number()
          .optional()
          .describe('Number of users this user follows.'),
        tweet_count: z
          .number()
          .optional()
          .describe('Number of Tweets posted by this user.'),
        listed_count: z
          .number()
          .optional()
          .describe('Number of lists that include this user.'),
      })
      .optional()
      .describe('Public engagement metrics for the user.'),
  })
  .passthrough();

// Tweet Schemas
export const TweetGeoSchema = z.object({
  place_id: z
    .string()
    .describe('Place ID being attached to the Tweet for geo location.'),
});

export const TweetMediaSchema = z.object({
  media_ids: z
    .array(z.string())
    .describe('A list of Media IDs to be attached to a created Tweet.'),
  tagged_user_ids: z
    .array(z.string())
    .optional()
    .describe('A list of User IDs to be tagged in the media.'),
});

export const TweetPollSchema = z.object({
  duration_minutes: z
    .number()
    .min(5)
    .max(10080)
    .describe('Duration of the poll in minutes.'),
  options: z.array(z.string()).describe('The text options for the poll.'),
  reply_settings: z
    .enum(['following', 'mentionedUsers'])
    .optional()
    .describe('Reply settings.'),
});

export const TweetReplySchema = z.object({
  in_reply_to_tweet_id: z
    .string()
    .describe('The ID of the Tweet being replied to.'),
  exclude_reply_user_ids: z
    .array(z.string())
    .optional()
    .describe('User IDs to exclude from reply.'),
});

export const TweetCreateSchema = z.object({
  text: z.string().describe('The content of the Tweet.'),
  card_uri: z.string().optional().describe('Card URI Parameter.'),
  community_id: z
    .string()
    .optional()
    .describe('The unique identifier of the Community.'),
  direct_message_deep_link: z
    .string()
    .optional()
    .describe('Link to private Direct Message.'),
  for_super_followers_only: z
    .boolean()
    .optional()
    .default(false)
    .describe('Super followers tweet.'),
  geo: TweetGeoSchema.optional().describe('Geo location.'),
  media: TweetMediaSchema.optional().describe('Media information.'),
  nullcast: z
    .boolean()
    .optional()
    .default(false)
    .describe('Promoted-only Posts.'),
  poll: TweetPollSchema.optional().describe('Poll options.'),
  quote_tweet_id: z
    .string()
    .optional()
    .describe('ID of the Tweet being quoted.'),
  reply: TweetReplySchema.optional().describe('Reply information.'),
  reply_settings: z
    .enum(['following', 'mentionedUsers', 'subscribers'])
    .optional(),
});

export const TweetResponseSchema = z
  .object({
    id: z.string().describe('Unique identifier of this Tweet.'),
    text: z.string().describe('The content of the Tweet.'),
    created_at: z.string().optional().describe('Creation time of the Tweet.'),
    author_id: z
      .string()
      .optional()
      .describe('The user who posted this Tweet.'),
    edit_history_tweet_ids: z
      .array(z.string())
      .optional()
      .describe('Previous tweet IDs.'),
  })
  .passthrough();

// Media Upload Response Schema
export const MediaUploadResponseSchema = z
  .object({
    media_id: z.number().optional().describe('The media ID as a number.'),
    media_id_string: z.string().describe('The media ID as a string.'),
    size: z.number().optional().describe('Size in bytes.'),
    expires_after_secs: z.number().optional().describe('Expiration time.'),
    image: z
      .object({
        image_type: z.string().optional().describe('Image type.'),
        w: z.number().optional().describe('Width.'),
        h: z.number().optional().describe('Height.'),
      })
      .optional()
      .describe('Image information.'),
  })
  .passthrough();

// Response Schemas
export const UserLookupResponseSchema = z
  .object({
    data: UserSchema.optional().describe('The requested User.'),
    errors: z
      .array(
        z.object({
          detail: z.string().optional(),
          status: z.number().optional(),
          title: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

export const MultipleUsersLookupResponseSchema = z
  .object({
    data: z.array(UserSchema).optional().describe('The requested Users.'),
    errors: z
      .array(
        z.object({
          detail: z.string().optional(),
          status: z.number().optional(),
          title: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

export const TweetLookupResponseSchema = z
  .object({
    data: TweetResponseSchema.optional(),
    errors: z
      .array(
        z.object({
          detail: z.string().optional(),
          status: z.number().optional(),
          title: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

export const TweetDeleteResponseSchema = z
  .object({
    data: z.object({
      deleted: z.boolean(),
    }),
    errors: z
      .array(
        z.object({
          detail: z.string().optional(),
          status: z.number().optional(),
          title: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

// Types
export type User = z.infer<typeof UserSchema>;
export type UserLookupResponse = z.infer<typeof UserLookupResponseSchema>;
export type MultipleUsersLookupResponse = z.infer<
  typeof MultipleUsersLookupResponseSchema
>;
export type TweetCreate = z.infer<typeof TweetCreateSchema>;
export type TweetResponse = z.infer<typeof TweetResponseSchema>;
export type TweetLookupResponse = z.infer<typeof TweetLookupResponseSchema>;
export type TweetDeleteResponse = z.infer<typeof TweetDeleteResponseSchema>;
export type MediaUploadResponse = z.infer<typeof MediaUploadResponseSchema>;

// Error Classes
export class XError extends Error {
  status?: number;
  errors?: any[];

  constructor(message: string, errorResponse?: any) {
    super(message);
    this.name = 'XError';
    if (errorResponse) {
      this.status = errorResponse.status;
      this.errors = errorResponse.errors;
    }
  }
}

// SDK Configuration Schema
export const XSDKConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key cannot be empty'),
  apiSecret: z.string().min(1, 'API secret cannot be empty'),
  accessToken: z.string().min(1, 'Access token cannot be empty'),
  accessSecret: z.string().min(1, 'Access secret cannot be empty'),
});

export type XSDKConfig = z.infer<typeof XSDKConfigSchema>;

// API Interfaces
export interface UsersAPI {
  getByUsername: (
    username: string,
    options?: { expansions?: string[] },
  ) => Promise<UserLookupResponse>;
  getByUsernames: (
    usernames: string[],
    options?: { expansions?: string[] },
  ) => Promise<MultipleUsersLookupResponse>;
  getById: (
    id: string,
    options?: { expansions?: string[] },
  ) => Promise<UserLookupResponse>;
  getByIds: (
    ids: string[],
    options?: { expansions?: string[] },
  ) => Promise<MultipleUsersLookupResponse>;
  getMe: (options?: { expansions?: string[] }) => Promise<UserLookupResponse>;
}

export interface PostsAPI {
  create: (tweet: TweetCreate) => Promise<TweetResponse>;
  get: (
    id: string,
    options?: { expansions?: string[] },
  ) => Promise<TweetLookupResponse>;
  getMultiple: (
    ids: string[],
    options?: { expansions?: string[] },
  ) => Promise<TweetLookupResponse>;
  delete: (id: string) => Promise<TweetDeleteResponse>;
}

export interface MediaAPI {
  upload: (buffer: Buffer, mimeType: string) => Promise<MediaUploadResponse>;
}

export interface XSDK {
  tweets: PostsAPI;
  users: UsersAPI;
  media: MediaAPI;
  generateOAuthHeader: (
    method: string,
    url: string,
    params?: Record<string, string>,
  ) => string;
}

export const createXSDK = (config: XSDKConfig): XSDK => {
  // Validate the config
  const validatedConfig = XSDKConfigSchema.parse(config);
  const { apiKey, apiSecret, accessToken, accessSecret } = validatedConfig;
  const baseUrl = 'https://api.twitter.com'; // Always use this URL

  /**
   * Makes an HTTPS request to the API.
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint (e.g., "/2/tweets")
   * @param params - Additional query or body parameters
   * @param body - Request body as a JSON object (if applicable)
   */
  const request = (
    method: string,
    endpoint: string,
    params: { [key: string]: string } = {},
    body: any = null,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        // Construct URL with query parameters for GET requests
        let urlPath = endpoint;
        const queryParams = new URLSearchParams(params);
        const queryString = queryParams.toString();
        if (method === 'GET' && queryString) {
          urlPath = `${endpoint}?${queryString}`;
        }

        const url = `${baseUrl}${endpoint}`;
        // console.log(`Making ${method} request to: ${url}`);
        // console.log('Query parameters:', params);

        // Generate OAuth header
        const authHeader = generateOAuthHeader(method, url, params);
        // console.log('Generated OAuth header:', authHeader);

        const options: RequestOptions = {
          method,
          hostname: 'api.twitter.com',
          path: urlPath, // Use the path with query parameters
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
            'User-Agent': 'X-SDK-Node',
          },
        };

        // console.log('Request options:', JSON.stringify(options, null, 2));

        const req = https.request(options, res => {
          let data = '';
          res.on('data', chunk => {
            data += chunk;
          });

          res.on('end', () => {
            // console.log('Response status:', res.statusCode);
            // console.log('Response headers:', res.headers);
            // console.log('Response data:', data);

            try {
              const parsed = JSON.parse(data);
              if (
                res.statusCode &&
                res.statusCode >= 200 &&
                res.statusCode < 300
              ) {
                resolve(parsed);
              } else {
                reject(
                  new XError(
                    `Request failed with status ${res.statusCode}`,
                    parsed,
                  ),
                );
              }
            } catch (error) {
              reject(new XError(`Failed to parse response: ${error}`));
            }
          });
        });

        req.on('error', error => {
          console.error('Request error:', error);
          reject(new XError(`Network error: ${error.message}`));
        });

        if (body) {
          const bodyString = JSON.stringify(body);
          // console.log('Request body:', bodyString);
          req.write(bodyString);
        }

        req.end();
      } catch (error) {
        console.error('Request preparation error:', error);
        reject(new XError(`Failed to make request: ${error}`));
      }
    });
  };

  /**
   * Generates an OAuth 1.0a header for a given HTTP method, URL, and parameters.
   */
  const generateOAuthHeader = (
    method: string,
    url: string,
    params: { [key: string]: string } = {},
  ): string => {
    try {
      // Basic OAuth parameters
      const oauthParams: { [key: string]: string } = {
        oauth_consumer_key: apiKey,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: accessToken,
        oauth_version: '1.0',
      };

      // console.log('OAuth params:', oauthParams);

      // For GET requests, include query parameters in signature
      const allParams =
        method === 'GET' ? { ...params, ...oauthParams } : { ...oauthParams };

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(allParams).sort();
      const paramString = sortedKeys
        .map(
          key =>
            `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`,
        )
        .join('&');

      // Create signature base string
      const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
      // console.log('Signature base string:', signatureBaseString);

      const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
      const oauthSignature = crypto
        .createHmac('sha1', signingKey)
        .update(signatureBaseString)
        .digest('base64');

      // console.log('Generated signature:', oauthSignature);
      oauthParams.oauth_signature = oauthSignature;

      // Build OAuth header string
      const authHeader =
        'OAuth ' +
        Object.keys(oauthParams)
          .sort()
          .map(
            key =>
              `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`,
          )
          .join(', ');

      // console.log('Final auth header:', authHeader);
      return authHeader;
    } catch (error) {
      console.error('Error generating OAuth header:', error);
      throw error;
    }
  };

  // Create Posts API
  const tweets: PostsAPI = {
    create: async (tweet: TweetCreate) => {
      try {
        const validatedTweet = TweetCreateSchema.parse(tweet);
        const response = await request('POST', '/2/tweets', {}, validatedTweet);
        if (!response.data)
          throw new XError('API response missing data object');
        return TweetResponseSchema.parse(response.data);
      } catch (error) {
        throw new XError(`Failed to create tweet: ${error}`);
      }
    },

    get: async (id: string, options?: { expansions?: string[] }) => {
      try {
        const params: Record<string, string> = {};
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', `/2/tweets/${id}`, params);
        return TweetLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get tweet: ${error}`);
      }
    },

    getMultiple: async (ids: string[], options?: { expansions?: string[] }) => {
      try {
        if (!ids.length || ids.length > 100) {
          throw new XError('Must provide between 1 and 100 tweet IDs');
        }
        const params: Record<string, string> = {
          ids: ids.join(','),
        };
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', '/2/tweets', params);
        return TweetLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get tweets: ${error}`);
      }
    },

    delete: async (id: string) => {
      try {
        const response = await request('DELETE', `/2/tweets/${id}`);
        return TweetDeleteResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to delete tweet: ${error}`);
      }
    },
  };

  // Create Users API
  const users: UsersAPI = {
    getByUsername: async (
      username: string,
      options?: { expansions?: string[] },
    ) => {
      try {
        const params: Record<string, string> = {};
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request(
          'GET',
          `/2/users/by/username/${encodeURIComponent(username)}`,
          params,
        );
        return UserLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get user by username: ${error}`);
      }
    },

    getByUsernames: async (
      usernames: string[],
      options?: { expansions?: string[] },
    ) => {
      try {
        if (!usernames.length || usernames.length > 100) {
          throw new XError('Must provide between 1 and 100 usernames');
        }
        const params: Record<string, string> = {
          usernames: usernames.join(','),
        };
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', '/2/users/by', params);
        return MultipleUsersLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get users by usernames: ${error}`);
      }
    },

    getById: async (id: string, options?: { expansions?: string[] }) => {
      try {
        const params: Record<string, string> = {};
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', `/2/users/${id}`, params);
        return UserLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get user by ID: ${error}`);
      }
    },

    getByIds: async (ids: string[], options?: { expansions?: string[] }) => {
      try {
        if (!ids.length || ids.length > 100) {
          throw new XError('Must provide between 1 and 100 user IDs');
        }
        const params: Record<string, string> = {
          ids: ids.join(','),
        };
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', '/2/users', params);
        return MultipleUsersLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get users by IDs: ${error}`);
      }
    },

    getMe: async (options?: { expansions?: string[] }) => {
      try {
        const params: Record<string, string> = {};
        if (options?.expansions?.length) {
          params.expansions = options.expansions.join(',');
        }
        const response = await request('GET', '/2/users/me', params);
        return UserLookupResponseSchema.parse(response);
      } catch (error) {
        throw new XError(`Failed to get authenticated user: ${error}`);
      }
    },
  };

  // Create Media API
  const media: MediaAPI = {
    upload: (
      buffer: Buffer,
      mimeType: string,
    ): Promise<MediaUploadResponse> => {
      return new Promise((resolve, reject) => {
        try {
          if (!buffer?.length) throw new XError('Media buffer cannot be empty');
          if (!mimeType) throw new XError('MIME type must be provided');

          const mediaEndpoint = '/1.1/media/upload.json';
          const fullUrl = 'https://upload.twitter.com' + mediaEndpoint;
          // console.log('Media upload URL:', fullUrl);

          const boundary = `--------------------------${crypto.randomBytes(32).toString('hex')}`;
          const CRLF = '\r\n';

          let bodyStart = '';
          bodyStart += `--${boundary}${CRLF}`;
          bodyStart += `Content-Disposition: form-data; name="media_type"${CRLF}${CRLF}`;
          bodyStart += `${mimeType}${CRLF}`;
          bodyStart += `--${boundary}${CRLF}`;
          bodyStart += `Content-Disposition: form-data; name="media"; filename="media.${mimeType.split('/')[1]}"${CRLF}`;
          bodyStart += `Content-Type: ${mimeType}${CRLF}${CRLF}`;

          const bodyEnd = `${CRLF}--${boundary}--${CRLF}`;
          const startBuffer = Buffer.from(bodyStart, 'utf8');
          const endBuffer = Buffer.from(bodyEnd, 'utf8');
          const finalBuffer = Buffer.concat([startBuffer, buffer, endBuffer]);

          const authHeader = generateOAuthHeader('POST', fullUrl, {
            media_type: mimeType,
            media_category: 'tweet_image',
          });

          const options: RequestOptions = {
            method: 'POST',
            hostname: 'upload.twitter.com',
            path: mediaEndpoint,
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': finalBuffer.length,
              Authorization: authHeader,
              'User-Agent': 'X-SDK-Node',
              Connection: 'keep-alive',
              Accept: '*/*',
            },
          };

          const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
              // console.log('Media upload response:', data);
              if (
                res.statusCode &&
                res.statusCode >= 200 &&
                res.statusCode < 300
              ) {
                try {
                  const parsedData = JSON.parse(data);
                  const validated =
                    MediaUploadResponseSchema.safeParse(parsedData);
                  if (validated.success) {
                    resolve(validated.data);
                  } else {
                    reject(
                      new XError(
                        `Invalid response format: ${validated.error.message}`,
                      ),
                    );
                  }
                } catch (error) {
                  reject(new XError(`Failed to parse response: ${error}`));
                }
              } else {
                reject(
                  new XError(
                    `HTTP ${res.statusCode}: ${res.statusMessage} - ${data}`,
                  ),
                );
              }
            });
          });

          req.on('error', error => {
            reject(new XError(`Network error: ${error.message}`));
          });

          req.write(finalBuffer);
          req.end();
        } catch (error) {
          reject(new XError(`Failed to upload media: ${error}`));
        }
      });
    },
  };

  return {
    tweets,
    users,
    media,
    generateOAuthHeader,
  };
};
