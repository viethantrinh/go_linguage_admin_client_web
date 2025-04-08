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

export interface CreateLessonRequest {
  name: string;
  lessonTypeId: number;
  topicId: number;
  exercises: {
    name: string;
    exerciseTypeId: number;
    displayOrder: number;
  }[];
}

export interface LessonDetail {
  id: number;
  lessonTypeId: number;
  topicId: number;
  name: string;
  exercises: {
    id?: number;
    name: string;
    exerciseTypeId: number;
    displayOrder: number;
  }[];
}

export interface UpdateLessonRequest {
  id: number;
  name: string;
  lessonTypeId: number;
  topicId: number;
  exercises: {
    id?: number;
    name: string;
    exerciseTypeId: number;
    displayOrder: number;
  }[];
}
