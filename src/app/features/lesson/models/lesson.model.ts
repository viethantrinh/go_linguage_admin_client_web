import {ApiResponse} from '../../../core/models/api-response.model';

export interface Lesson {
  id: number;
  lessonTypeId: number;
  name: string;
  topicName: string;
  displayOrder: number;
  createdAt: string;
}

export interface LessonResponse extends ApiResponse<Lesson[]> {}
export interface DeleteLessonResponse extends ApiResponse<null> {}
