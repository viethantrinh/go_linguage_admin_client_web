export interface DialogueExercise {
  id?: number;
  context: string;
  exerciseId: number;
  dialogueLines: DialogueExerciseLine[];
}

export interface DialogueExerciseLine {
  id?: number;
  dialogueExerciseId?: number;
  speaker: 'A' | 'B';
  englishText: string;
  vietnameseText: string;
  audioUrl?: string;
  displayOrder: number;
  hasBlank: boolean;
  blankWord: string | null;
}

export interface DialogueExerciseCreateDto {
  context: string;
  exerciseId: number;
  dialogueLines: DialogueExerciseLine[];
}

export interface DialogueExerciseUpdateDto {
  context: string;
  exerciseId: number;
  dialogueLines: DialogueExerciseLine[];
}
