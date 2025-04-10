export const LinkedInScope = {
  // OpenID Connect scopes
  OPENID: 'openid',
  PROFILE: 'profile',
  EMAIL: 'email',

  // Basic profile scopes
  BASIC_PROFILE: 'r_basicprofile',
  FULL_PROFILE: 'r_fullprofile',

  // Contact scopes
  CONTACTS: 'r_contacts',
  CONTACTS_READONLY: 'r_contacts_readonly',

  // Email scopes
  EMAIL_ADDRESS: 'r_emailaddress',

  // Organization scopes
  ORGANIZATION: 'r_organization_social',
  ORGANIZATION_ADMIN: 'w_organization_social',

  // Content sharing scopes
  SHARE: 'w_member_social',
  SHARE_READONLY: 'r_member_social',

  // Job posting scopes
  JOBS: 'w_job_posting',
  JOBS_READONLY: 'r_job_posting',

  // Company scopes
  COMPANY: 'r_company_admin',
  COMPANY_READONLY: 'r_company_admin_readonly',

  // Groups scopes
  GROUPS: 'r_groups',
  GROUPS_READONLY: 'r_groups_readonly',

  // Ads scopes
  ADS: 'r_ads',
  ADS_READONLY: 'r_ads_readonly',
  ADS_REPORTING: 'r_ads_reporting',

  // Marketing Developer Platform scopes
  MARKETING: 'r_marketing',
  MARKETING_READONLY: 'r_marketing_readonly',

  // Offline access (for refresh tokens)
  OFFLINE_ACCESS: 'r_liteprofile r_emailaddress w_member_social offline_access',
} as const;

export type LinkedInScope = (typeof LinkedInScope)[keyof typeof LinkedInScope];

export interface LinkedInAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: Array<LinkedInScope | string>;
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
