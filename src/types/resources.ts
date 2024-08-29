export interface resourceJsonMeta {
  name: string;
  description: string;
  url: string;
}

export interface articleJsonMeta {
  id: string;
  title: string;
  description: string;
  date: string;
  lastModified: string;
  path: string;
}
export interface FontMatter {
  title: string;
  description: string;
  date: string;
}

export interface Article {
  path: string;
  title: string;
  description: string;
  date: string;
  content: string;
  lastModified: string;
}
