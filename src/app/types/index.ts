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