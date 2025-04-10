export interface VocabularyWord {
  wordId: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  audioUrl?: string;
  isSelectedByAnotherExercise: boolean;
}

export interface VocabularyExerciseDetail {
  exerciseId: number;
  exerciseName: string;
  relatedWordId?: number;
}

export interface VocabularyExerciseRequest {
  exerciseId: number;
  wordId: number;
}
