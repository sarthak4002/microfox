import type { MediaCategory, MediaContent } from '../schemas/share';

export type LinkedInVisibility = 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';

export interface LinkedInMediaContent extends MediaContent {}

export interface LinkedInPostOptions {
  text: string;
  visibility?: LinkedInVisibility;
  mediaCategory?: MediaCategory;
  media?: MediaContent[];
  isDraft?: boolean;
}

export interface LinkedInShareContent {
  author: string;
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: MediaCategory;
      media?: Array<{
        status: 'READY';
        originalUrl?: string;
        title?: {
          text: string;
        };
        description?: {
          text: string;
        };
        thumbnails?: Array<{
          url: string;
        }>;
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': LinkedInVisibility;
  };
}

/**
 * We only get the 'id' from the response @subhakar @vishwajeet
 */
export interface LinkedInShareResponse {
  id: string;
  // activity: string;
  // created: {
  //   actor: string;
  //   time: number;
  // };
  // lastModified: {
  //   actor: string;
  //   time: number;
  // };
  // lifecycleState: string;
}

export interface LinkedInError {
  error: string;
  error_description?: string;
}
