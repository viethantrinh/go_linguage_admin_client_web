export interface Sentence {
  id: number;
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
  topicIds: number[];
  wordIds: number[];
}

export interface SentencePayload {
  englishText: string;
  vietnameseText: string;
  topicIds: number[];
  wordIds: number[];
}

export interface Topic {
  id: number;
  name: string;
}

export interface Word {
  id: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
  topicIds: number[];
  sentenceIds: number[];
}
