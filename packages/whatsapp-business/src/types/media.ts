export interface MediaObject {
  id?: string;
  link?: string;
  caption?: string;
}

export interface ImageObject extends MediaObject {
  mime_type?: string;
  sha256?: string;
}

export interface VideoObject extends MediaObject {
  mime_type?: string;
  sha256?: string;
}

export interface DocumentObject extends MediaObject {
  filename?: string;
  mime_type?: string;
  sha256?: string;
}

export interface AudioObject extends MediaObject {
  mime_type?: string;
  sha256?: string;
}

export interface StickerObject extends MediaObject {
  mime_type?: string;
  sha256?: string;
}
