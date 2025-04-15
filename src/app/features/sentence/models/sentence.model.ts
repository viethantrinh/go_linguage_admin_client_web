import { ApiResponse } from '../../../core/models/api-response.model';

export interface Sentence {
  id: number;
  englishText: string;
  vietnameseText: string;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  topicIds: number[];
  wordIds: number[];
}

export interface SentenceResponse extends ApiResponse<Sentence[]> {}

export interface SentenceDetailResponse extends ApiResponse<Sentence> {}

export interface CreateSentenceRequest {
  englishText: string;
  vietnameseText: string;
  topicIds: number[];
  wordIds: number[];
}

export interface UpdateSentenceRequest {
  englishText: string;
  vietnameseText: string;
  topicIds: number[];
  wordIds: number[];
}

export interface DeleteSentenceResponse extends ApiResponse<void> {
  // No additional fields needed as API just returns status
}
