export interface Song {
  id: number;
  title: string;
  englishLyrics: string;
  vietnameseLyrics: string;
  audioUrl: string;
  cloudinaryUrl?: string;
  genres: string[];
  createdDate: Date;
  wordTimings?: WordTiming[];
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SongResponse {
  items: Song[];
  totalCount: number;
}

export interface SongCreateDto {
  title: string;
  englishLyrics: string;
  vietnameseLyrics: string;
  audioUrl: string;
  genres: string[];
  wordTimings?: WordTiming[];
}

export interface SongUpdateDto extends SongCreateDto {
  id: number;
}
