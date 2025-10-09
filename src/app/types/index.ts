export interface ImageRecord {
  id: string;
  filename: string;
  description: string;
  imageUrl?: string;
  embedding: number[];
  uploaded_at: string;
  similarity?: number;
}

export interface SearchResult {
  id: string;
  filename: string;
  description: string;
  imageUrl?: string;
  similarity: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: string;
}

export interface Message {
 id: string;
 role: 'user' | 'assistant';
 content: string;
 metadata?: any;
 created_at: string;
}

export interface ImageRecord {
 id: string;
 filename: string;
 description: string;
 image_url?: string;
 embedding: number[];
 uploaded_at: string;
}

export interface SearchResult extends Omit<ImageRecord, 'embedding'> {
 similarity: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: string;
}

export interface ImageRecord {
  id: string;
  filename: string;
  description: string;
  image_url?: string;
  uploaded_at: string;
}

export interface SearchResult extends Omit<ImageRecord, 'uploaded_at'> {
  similarity: number;
}