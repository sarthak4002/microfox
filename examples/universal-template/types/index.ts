export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
}

export interface FunctionParams {
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface TestFunctionRequest {
  accessToken: string;
  params: FunctionParams;
} 