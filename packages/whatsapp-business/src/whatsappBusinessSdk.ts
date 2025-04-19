import type {
  WhatsAppSDKConfig,
  MessageOptions,
  TextMessageOptions,
  MediaMessageOptions,
  DocumentMessageOptions,
  TemplateMessageOptions,
  AnalyticsOptions,
  TemplateOptions,
  RequestOptions,
  InteractiveMessage,
  ImageObject,
  VideoObject,
  DocumentObject,
  AudioObject,
  StickerObject,
  LocationObject,
  ContactObject,
  TemplateComponent,
} from './types';

class WhatsAppBusinessSDKError extends Error {
  code: number;
  originalError: any;

  constructor(message: string, code: number, originalError?: any) {
    super(message);
    this.name = 'WhatsAppBusinessSDKError';
    this.code = code;
    this.originalError = originalError;
  }
}

class WhatsAppBusinessSDK {
  private phoneNumberId: string;
  private businessAccountId: string;
  private version: string;
  private baseUrl: string;
  private accessToken: string;

  constructor(config: WhatsAppSDKConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.version = config.version || 'v22.0';
    this.baseUrl =
      config.baseUrl || `https://graph.facebook.com/${this.version}`;
    this.accessToken = config.accessToken;
  }

  /**
   * Send a text message
   * @param {string} to - Recipient's phone number in international format
   * @param {string} text - Message text content
   * @param {TextMessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendTextMessage(
    to: string,
    text: string,
    options: TextMessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'text',
      text: {
        body: text,
        preview_url: options.previewUrl || false,
      },
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send an image message
   * @param {string} to - Recipient's phone number in international format
   * @param {ImageObject} image - Image object with id, link or base64 data
   * @param {MediaMessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendImageMessage(
    to: string,
    image: ImageObject,
    options: MediaMessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'image',
      image,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a video message
   * @param {string} to - Recipient's phone number in international format
   * @param {VideoObject} video - Video object with id, link or base64 data
   * @param {MediaMessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendVideoMessage(
    to: string,
    video: VideoObject,
    options: MediaMessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'video',
      video,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a document message
   * @param {string} to - Recipient's phone number in international format
   * @param {DocumentObject} document - Document object with id, link or base64 data
   * @param {DocumentMessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendDocumentMessage(
    to: string,
    document: DocumentObject,
    options: DocumentMessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'document',
      document,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send an audio message
   * @param {string} to - Recipient's phone number in international format
   * @param {AudioObject} audio - Audio object with id, link or base64 data
   * @param {MessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendAudioMessage(
    to: string,
    audio: AudioObject,
    options: MessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'audio',
      audio,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a sticker message
   * @param {string} to - Recipient's phone number in international format
   * @param {StickerObject} sticker - Sticker object with id, link or base64 data
   * @param {MessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendStickerMessage(
    to: string,
    sticker: StickerObject,
    options: MessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'sticker',
      sticker,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a location message
   * @param {string} to - Recipient's phone number in international format
   * @param {LocationObject} location - Location object with coordinates and optional name/address
   * @param {MessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendLocationMessage(
    to: string,
    location: LocationObject,
    options: MessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'location',
      location,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a contact message
   * @param {string} to - Recipient's phone number in international format
   * @param {ContactObject[]} contacts - Array of contact objects
   * @param {MessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendContactMessage(
    to: string,
    contacts: ContactObject[],
    options: MessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'contacts',
      contacts,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send an interactive message (buttons or list)
   * @param {string} to - Recipient's phone number in international format
   * @param {InteractiveMessage} interactive - Interactive message object
   * @param {MessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendInteractiveMessage(
    to: string,
    interactive: InteractiveMessage,
    options: MessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'interactive',
      interactive,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Send a template message
   * @param {string} to - Recipient's phone number in international format
   * @param {string} templateName - Name of the template
   * @param {string} language - Language code
   * @param {TemplateComponent[]} [components=[]] - Template components
   * @param {TemplateMessageOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components: TemplateComponent[] = [],
    options: TemplateMessageOptions = {},
  ): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: options.recipientType || 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components,
      },
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Mark a message as read
   * @param {string} messageId - ID of the message to mark as read
   * @returns {Promise} - API response
   */
  async markMessageAsRead(messageId: string): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    return this._makeRequest(`/${this.phoneNumberId}/messages`, 'POST', data);
  }

  /**
   * Upload media to WhatsApp servers
   * @param {File|Blob|Buffer} media - Media file to upload
   * @param {string} type - Media type (image, document, audio, video, sticker)
   * @returns {Promise} - API response with media ID
   */
  async uploadMedia(media: File | Blob, type: string): Promise<any> {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', media);
    formData.append('type', type);

    return this._makeRequest(`/${this.phoneNumberId}/media`, 'POST', formData, {
      isFormData: true,
    });
  }

  /**
   * Download media from WhatsApp servers
   * @param {string} mediaId - ID of the media to download
   * @returns {Promise} - API response with media data
   */
  async downloadMedia(mediaId: string): Promise<any> {
    return this._makeRequest(`/${mediaId}`, 'GET');
  }

  /**
   * Get media URL from WhatsApp servers
   * @param {string} mediaId - ID of the media
   * @returns {Promise} - API response with media URL
   */
  async getMediaUrl(mediaId: string): Promise<any> {
    return this._makeRequest(`/${mediaId}`, 'GET');
  }

  /**
   * Register a phone number
   * @param {string} phoneNumber - Phone number to register
   * @param {string} pin - PIN code
   * @returns {Promise} - API response
   */
  async registerPhone(phoneNumber: string, pin: string): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      pin,
    };

    return this._makeRequest(`/${phoneNumber}/register`, 'POST', data);
  }

  /**
   * Deregister a phone number
   * @param {string} phoneNumber - Phone number to deregister
   * @returns {Promise} - API response
   */
  async deregisterPhone(phoneNumber: string): Promise<any> {
    return this._makeRequest(`/${phoneNumber}/deregister`, 'POST', {
      messaging_product: 'whatsapp',
    });
  }

  /**
   * Get business profile information
   * @returns {Promise} - API response with business profile data
   */
  async getBusinessProfile(): Promise<any> {
    return this._makeRequest(
      `/${this.phoneNumberId}/whatsapp_business_profile`,
      'GET',
    );
  }

  /**
   * Update business profile information
   * @param {object} profileData - Business profile data to update
   * @returns {Promise} - API response
   */
  async updateBusinessProfile(profileData: any): Promise<any> {
    const data = {
      messaging_product: 'whatsapp',
      ...profileData,
    };

    return this._makeRequest(
      `/${this.phoneNumberId}/whatsapp_business_profile`,
      'POST',
      data,
    );
  }

  /**
   * Get a list of templates
   * @param {object} options - Additional options like limit, offset
   * @returns {Promise} - API response with templates
   */
  async getTemplates(options: TemplateOptions = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      limit: options.limit?.toString() || '20',
      offset: options.offset?.toString() || '0',
    }).toString();

    return this._makeRequest(
      `/${this.businessAccountId}/message_templates?${queryParams}`,
      'GET',
    );
  }

  /**
   * Create a new template
   * @param {object} templateData - Template data
   * @returns {Promise} - API response
   */
  async createTemplate(templateData: any): Promise<any> {
    const data = {
      name: templateData.name,
      category: templateData.category,
      components: templateData.components,
      language: templateData.language,
    };

    return this._makeRequest(
      `/${this.businessAccountId}/message_templates`,
      'POST',
      data,
    );
  }

  /**
   * Delete a template
   * @param {string} templateName - Name of the template to delete
   * @returns {Promise} - API response
   */
  async deleteTemplate(templateName: string): Promise<any> {
    return this._makeRequest(
      `/${this.businessAccountId}/message_templates?name=${templateName}`,
      'DELETE',
    );
  }

  /**
   * Get the QR code for a phone number
   * @returns {Promise} - API response with QR code data
   */
  async getQRCode(): Promise<any> {
    return this._makeRequest(`/${this.phoneNumberId}/qr_code`, 'GET');
  }

  /**
   * Get phone numbers in the business account
   * @returns {Promise} - API response with phone numbers
   */
  async getPhoneNumbers(): Promise<any> {
    return this._makeRequest(`/${this.businessAccountId}/phone_numbers`, 'GET');
  }

  /**
   * Get analytics for a phone number
   * @param {object} options - Query parameters
   * @returns {Promise} - API response with analytics data
   */
  async getAnalytics(options: AnalyticsOptions = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      start: options.start || '',
      end: options.end || '',
      granularity: options.granularity || 'DAY',
      ...options,
    }).toString();

    return this._makeRequest(
      `/${this.phoneNumberId}/insights?${queryParams}`,
      'GET',
    );
  }

  /**
   * Get the WhatsApp Commerce account settings
   * @returns {Promise} - API response with settings
   */
  async getCommerceSettings(): Promise<any> {
    return this._makeRequest(
      `/${this.businessAccountId}/whatsapp_commerce_settings`,
      'GET',
    );
  }

  /**
   * Update the WhatsApp Commerce account settings
   * @param {object} settings - Settings to update
   * @returns {Promise} - API response
   */
  async updateCommerceSettings(settings: any): Promise<any> {
    return this._makeRequest(
      `/${this.businessAccountId}/whatsapp_commerce_settings`,
      'POST',
      settings,
    );
  }

  /**
   * Make a request to the WhatsApp API
   * @private
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {any} data - Request data
   * @param {RequestOptions} [options={}] - Additional options
   * @returns {Promise<any>} - API response
   */
  private async _makeRequest(
    endpoint: string,
    method: string,
    data: any = null,
    options: RequestOptions = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    if (data && !options.isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (options.isFormData) {
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        throw new WhatsAppBusinessSDKError(
          responseData.error?.message || 'Unknown error',
          responseData.error?.code || response.status,
          responseData,
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof WhatsAppBusinessSDKError) {
        throw error;
      }
      throw new WhatsAppBusinessSDKError('Network error', 0, error);
    }
  }
}

// Export the WhatsApp SDK
export { WhatsAppBusinessSDK, WhatsAppBusinessSDKError };
