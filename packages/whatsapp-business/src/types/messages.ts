export interface MessageOptions {
  recipientType?: 'individual' | 'group';
  checkWindow?: boolean;
  templateFallback?: {
    name: string;
    language: string;
    components?: any[];
  };
}

export interface TextMessageOptions extends MessageOptions {
  previewUrl?: boolean;
}

export interface MediaMessageOptions extends MessageOptions {
  caption?: string;
}

export interface DocumentMessageOptions extends MediaMessageOptions {
  filename?: string;
}

export interface TemplateMessageOptions extends MessageOptions {
  recipientType?: 'individual' | 'group';
}
