import { ApiResponse } from '../../../core/models/api-response.model';

// Word model as returned from API
export interface Word {
  id: number;
  englishText: string;
  vietnameseText: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  topicIds: number[];
  sentenceIds: number[];
}

// Request model for creating a new word
export interface CreateWordRequest {
  englishText: string;
  vietnameseText: string;
  topicIds: number[];
  sentenceIds: number[];
}

// Request model for updating a word
export interface UpdateWordRequest {
  englishText: string;
  vietnameseText: string;
  topicIds: number[];
  sentenceIds: number[];
}

// Response wrapper for word API
export type WordResponse = ApiResponse<Word>;

// Response wrapper for word list API
export type WordListResponse = ApiResponse<Word[]>;

// Response after image upload
export interface UploadImageResponse {
  imageUrl: string;
}

// Topic model
export interface Topic {
  id: number;
  name: string;
}

// Response wrapper for topic list API
export type TopicListResponse = ApiResponse<Topic[]>;

// Sentence model
export interface Sentence {
  id: number;
  englishText: string;
  vietnameseText: string;
  audioUrl: string;
  createdAt: string;
  updatedAt: string | null;
  topicIds: number[];
  wordIds: number[];
}

// Response wrapper for sentence list API
export type SentenceListResponse = ApiResponse<Sentence[]>;
