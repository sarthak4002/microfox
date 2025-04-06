import {
  LinkedInShareContent,
  LinkedInShareResponse,
  LinkedInPostOptions,
  LinkedInMediaContent,
  LinkedInError,
} from './types';
import {
  shareContentSchema,
  shareResponseSchema,
  postOptionsSchema,
} from './schemas/share';

export class LinkedinShareSdk {
  private static readonly API_BASE_URL = 'https://api.linkedin.com/v2';
  private accessToken: string;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    this.accessToken = accessToken;
  }

  /**
   * Post content to LinkedIn with flexible options
   * @param options The post options including text, media, and visibility settings
   * @returns The response from LinkedIn
   *
   * @example
   * // Simple text post
   * await linkedinShare.post({ text: 'Hello LinkedIn!' });
   *
   * // Article share
   * await linkedinShare.post({
   *   text: 'Check out this article!',
   *   mediaCategory: 'ARTICLE',
   *   media: [{
   *     url: 'https://example.com/article',
   *     title: 'Amazing Article',
   *     description: 'This is a must-read article'
   *   }]
   * });
   *
   * // Image share
   * await linkedinShare.post({
   *   text: 'Check out this image!',
   *   mediaCategory: 'IMAGE',
   *   media: [{
   *     url: 'https://example.com/image.jpg',
   *     title: 'My Image'
   *   }]
   * });
   */
  public async post(
    options: LinkedInPostOptions,
  ): Promise<LinkedInShareResponse> {
    // Validate options with Zod schema
    const validatedOptions = postOptionsSchema.parse(options);

    const {
      text,
      visibility = 'PUBLIC',
      mediaCategory = 'NONE',
      media = [],
      isDraft = false,
    } = validatedOptions;

    const content: LinkedInShareContent = {
      author: `urn:li:person:${await this.getUserId()}`,
      lifecycleState: isDraft ? 'DRAFT' : 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: mediaCategory,
          ...(media.length > 0 && {
            media: media.map((item: LinkedInMediaContent) => ({
              status: 'READY',
              originalUrl: item.url,
              ...(item.title && {
                title: {
                  text: item.title,
                },
              }),
              ...(item.description && {
                description: {
                  text: item.description,
                },
              }),
              ...(item.thumbnailUrl && {
                thumbnails: [
                  {
                    url: item.thumbnailUrl,
                  },
                ],
              }),
            })),
          }),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    return this.share(content);
  }

  /**
   * Internal method to make the API call to LinkedIn
   */
  private async share(
    content: LinkedInShareContent,
  ): Promise<LinkedInShareResponse> {
    // Validate content with Zod schema
    const validatedContent = shareContentSchema.parse(content);

    const response = await fetch(`${LinkedinShareSdk.API_BASE_URL}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedContent),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as LinkedInError;
      throw new Error(
        `${error.error}: ${error.error_description || 'Unknown error'}`,
      );
    }

    // Validate response with Zod schema
    return shareResponseSchema.parse(data);
  }

  /**
   * Get the current user's LinkedIn ID
   */
  private async getUserId(): Promise<string> {
    const response = await fetch(`${LinkedinShareSdk.API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as LinkedInError;
      throw new Error(
        `${error.error}: ${error.error_description || 'Unknown error'}`,
      );
    }

    if (typeof data.id !== 'string') {
      throw new Error('Invalid user ID response from LinkedIn');
    }

    return data.id;
  }
}
