export interface Song {
  id: number;
  name: string;
  englishLyric: string;
  vietnameseLyric: string;
  audioUrl?: string;
  sunoTaskId?: string;
  creationStatus?: string;
  timestamps?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
}

export interface SongResponse {
  items: Song[];
  totalCount: number;
}

export interface SongCreateDto {
  name: string;
  words: string[];
}

export interface SongUpdateDto {
  id: number;
  name: string;
}

export interface SongStatusResponse {
  status: boolean;
  name: string;
  audioUrl: string | null;
}

export interface SongList {
  id: number;
  name: string;
  displayOrder: number;
  englishLyric: string;
  vietnameseLyric: string;
  audioUrl: string;
  sunoTaskId: string | null;
  creationStatus: string | null;
  createdAt: string;
}
