export interface Word {
  wordId: number;
  englishText: string;
  vietnameseText: string;
  imageUrl?: string;
  audioUrl?: string;
  isSelectedByAnotherExercise?: boolean;
}

export interface Sentence {
  sentenceId: number;
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
  isSelectedByAnotherExercise?: boolean;
}

export enum QuestionType {
  WORD = 'word',
  SENTENCE = 'sentence',
  AUDIO = 'audio'
}

export enum LanguageType {
  ENGLISH = 'english',
  VIETNAMESE = 'vietnamese'
}

export enum OptionType {
  WORD = 'word',
  SENTENCE = 'sentence'
}

export interface MultipleChoiceOption {
  id?: number;
  wordId?: number;
  sentenceId?: number;
  optionType: OptionType;
  isCorrect: boolean;
  word?: Word;
  sentence?: Sentence;
}

export interface MultipleChoiceExerciseDetail {
  exerciseId: number;
  exerciseName: string;
  instruction?: string;
  questionType: QuestionType;
  sourceLanguage: LanguageType;
  targetLanguage: LanguageType;
  wordId?: number;
  sentenceId?: number;
  // Thu00eam tru01b0u1eddng relatedSentenceId du1ef1a theo API response
  relatedSentenceId?: number;
  relatedWordId?: number;
  word?: Word;
  sentence?: Sentence;
  options: MultipleChoiceOption[];
}

export interface MultipleChoiceExerciseRequest {
  exerciseId: number;
  wordId?: number | null;
  sentenceId?: number | null;
  questionType: QuestionType;
  sourceLanguage: LanguageType;
  targetLanguage: LanguageType;
  options: {
    id?: number;
    wordId?: number | null;
    sentenceId?: number | null;
    optionType: string;
    isCorrect: boolean;
  }[];
}
