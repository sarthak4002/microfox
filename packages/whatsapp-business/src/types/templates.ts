export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  parameters?: TemplateParameter[];
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link?: string;
  };
  document?: {
    link?: string;
    filename?: string;
  };
  video?: {
    link?: string;
  };
}

export interface TemplateMessage {
  name: string;
  language: {
    code: string;
  };
  components: TemplateComponent[];
}

export interface TemplateOptions {
  limit?: number;
  offset?: number;
}
