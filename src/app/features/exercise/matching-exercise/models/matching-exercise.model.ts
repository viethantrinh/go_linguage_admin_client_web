export interface Word {
  wordId: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface MatchingPair {
  id?: number;
  matchingExerciseId?: number;
  wordId?: number; // May be accessed from word object in API responses
  word?: Word;
}

export interface MatchingExerciseDetail {
  exerciseId: number;
  exerciseName: string;
  instruction?: string;
  matchingPairs: MatchingPair[];
}

export interface MatchingExerciseRequest {
  exerciseId: number;
  matchingPairs: {
    id?: number;
    wordId: number;
  }[];
}
