export interface Conversation {
  id: number;
  name: string;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  lines: ConversationLine[];
}

export enum LineType {
  system = 'system',
  user = 'user'
}

export interface ConversationLine {
  id: number;
  systemEnglishText?: string;
  systemVietnameseText?: string;
  systemAudioUrl?: string;
  displayOrder: number;
  type: string;
  options?: ConversationOption[];
}

export interface ConversationOption {
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
  gender?: string;
}

export interface ConversationCreateDto {
  name: string;
  displayOrder?: number;
  lines: ConversationLineCreateDto[];
}

export interface ConversationLineCreateDto {
  type: string;
  englishText?: string;
  vietnameseText?: string;
  options?: ConversationOptionCreateDto[];
}

export interface ConversationOptionCreateDto {
  englishText: string;
  vietnameseText: string;
}

export interface ConversationUpdateDto {
  id: number;
  name: string;
}

export interface ConversationList {
  id: number;
  name: string;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  lineCount: number;
}
