/**
 * Configuration options for the Google OAuth SDK
 */
export interface GoogleAuthConfig {
  /**
   * The client ID obtained from the Google Developer Console
   */
  clientId: string;

  /**
   * The client secret obtained from the Google Developer Console
   */
  clientSecret: string;

  /**
   * The redirect URI registered in the Google Developer Console
   */
  redirectUri: string;

  /**
   * The scopes to request during authorization
   */
  scopes?: GoogleScope[];

  /**
   * Optional state parameter for CSRF protection
   */
  state?: string;
}

/**
 * Available scopes for Google OAuth
 */
export enum GoogleScope {
  OPENID = 'openid',
  EMAIL = 'email',
  PROFILE = 'profile',
  CALENDAR = 'https://www.googleapis.com/auth/calendar',
  DRIVE = 'https://www.googleapis.com/auth/drive',
  GMAIL = 'https://www.googleapis.com/auth/gmail.readonly',
  CONTACTS = 'https://www.googleapis.com/auth/contacts.readonly',
  YOUTUBE = 'https://www.googleapis.com/auth/youtube',
  PHOTOS = 'https://www.googleapis.com/auth/photoslibrary.readonly',
  FITNESS = 'https://www.googleapis.com/auth/fitness.activity.read',
  TASKS = 'https://www.googleapis.com/auth/tasks',
  SHEETS = 'https://www.googleapis.com/auth/spreadsheets.readonly',
  DOCS = 'https://www.googleapis.com/auth/documents.readonly',
}

/**
 * Token response from Google OAuth
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

/**
 * Error response from Google OAuth
 */
export interface ErrorResponse {
  error: string;
  error_description?: string;
}
