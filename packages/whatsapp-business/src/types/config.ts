export interface WhatsAppSDKConfig {
  phoneNumberId: string;
  businessAccountId: string;
  baseUrl?: string;
  version?: string;
  accessToken: string;
}

export interface RequestOptions {
  isFormData?: boolean;
}
