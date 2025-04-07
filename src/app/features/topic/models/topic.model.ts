export interface Topic {
  id: number;
  name: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
  isPremium: boolean;
}

// Define Topic model for form and UI
export interface TopicForm {
  id: number;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  createdDate: Date;
  // displayOrder: number;
}

// Define interfaces for better type safety
export interface Lesson {
  id?: number;
  title: string;
  typeId: number;
}

export interface LessonType {
  id: number;
  name: string;
}

export interface TopicLevel {
  id: number;
  name: string;
}
