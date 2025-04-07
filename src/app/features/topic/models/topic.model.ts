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
}
