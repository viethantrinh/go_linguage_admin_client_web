export enum LanguageType {
  ENGLISH = 'english',
  VIETNAMESE = 'vietnamese'
}

export interface Sentence {
  sentenceId: number;
  englishText: string;
  vietnameseText: string;
  isSelectedByAnotherExercise?: boolean;
}

export interface WordArrangementOption {
  id?: number;
  wordArrangementExerciseId?: number;
  wordText: string;
  isDistractor: boolean;
  correctPosition?: number | null;
}

export interface WordArrangementExerciseDetail {
  exerciseId: number;
  exerciseName: string;
  instruction?: string;
  sentenceId: number;
  sentence?: Sentence;
  sourceLanguage: LanguageType;
  targetLanguage: LanguageType;
  options: WordArrangementOption[];
}

export interface WordArrangementExerciseRequest {
  exerciseId: number;
  sentenceId: number;
  sourceLanguage: LanguageType;
  targetLanguage: LanguageType;
  options: {
    id?: number;
    wordText: string;
    isDistractor: boolean;
    correctPosition?: number | null;
  }[];
}
