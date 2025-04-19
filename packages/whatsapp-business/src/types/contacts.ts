export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactPhone {
  phone: string;
  type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
  wa_id?: string;
}

export interface ContactEmail {
  email?: string;
  type?: 'HOME' | 'WORK';
}

export interface ContactUrl {
  url?: string;
  type?: 'HOME' | 'WORK';
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: 'HOME' | 'WORK';
}

export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

export interface ContactObject {
  name: ContactName;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  urls?: ContactUrl[];
  addresses?: ContactAddress[];
  org?: ContactOrg;
  birthday?: string;
}
