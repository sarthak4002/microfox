export const LinkedInScope = {
  OPENID: 'openid',
  PROFILE: 'profile',
  W_MEMBER_SOCIAL: 'w_member_social',
  EMAIL: 'email',
  OFFLINE_ACCESS: 'r_liteprofile r_emailaddress w_member_social offline_access',
} as const;

export type LinkedInScope = (typeof LinkedInScope)[keyof typeof LinkedInScope];

export interface LinkedInAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: LinkedInScope[];
  state?: string;
}

export interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    displayImage: string;
  };
}

export interface LinkedInError {
  error: string;
  error_description?: string;
}
