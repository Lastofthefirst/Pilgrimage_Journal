export interface TextNote {
  id: string;
  title: string;
  body: string; // HTML content
  site: string;
  type: 'text';
  created: string; // ISO date string
  easyCreatedTime: string; // MM/DD/YYYY format
}

export interface AudioNote {
  id: string;
  title: string;
  uri: string; // Blob URL or base64
  site: string;
  type: 'audio';
  created: string;
  easyCreatedTime: string;
}

export interface ImageNote {
  id: string;
  title: string;
  uri: string; // Blob URL or base64
  site: string;
  type: 'image';
  created: string;
  easyCreatedTime: string;
}

export type Note = TextNote | AudioNote | ImageNote;

export interface Site {
  index: number;
  name: string;
  city: string;
  address: string;
  image: string;
  quote: string;
  reference: string;
}

export interface SiteCardData {
  index: number;
  name: string;
  city: string;
  image: string;
  quote: string;
}
