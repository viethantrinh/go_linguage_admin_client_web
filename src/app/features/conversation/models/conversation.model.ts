export interface Conversation {
  id: number;
  name: string;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  lines: ConversationLine[];
}

export enum LineType {
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export interface ConversationLine {
  id: number;
  conversationId: number;
  lineNumber: number;
  type: LineType;
  englishText?: string;
  vietnameseText?: string;
  audioUrl?: string;
  options?: ConversationOption[];
}

export interface ConversationOption {
  id: number;
  lineId: number;
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
}

export interface ConversationResponse {
  items: Conversation[];
  totalCount: number;
}

export interface ConversationCreateDto {
  name: string;
  displayOrder: number;
  imageUrl?: string;
  lines: ConversationLineCreateDto[];
}

export interface ConversationLineCreateDto {
  type: LineType;
  englishText?: string;
  vietnameseText?: string;
  audioUrl?: string;
  options?: ConversationOptionCreateDto[];
}

export interface ConversationOptionCreateDto {
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
}

export interface ConversationUpdateDto {
  id: number;
  name: string;
  displayOrder: number;
  imageUrl?: string;
}

export interface ConversationList {
  id: number;
  name: string;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  lineCount: number;
}
