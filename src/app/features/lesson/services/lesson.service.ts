import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BASE_LOCAL_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';
import {CreateLessonRequest, DeleteLessonResponse, LessonResponse} from '../models/lesson.model';


@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private readonly baseUrl = `${BASE_LOCAL_URL}/lessons/admin`;

  constructor(private http: HttpClient) {
  }

  /**
   * Get all lessons for admin
   */
  getLessons(): Observable<LessonResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<LessonResponse>(`${this.baseUrl}/list`, {headers: headers});
  }

  /**
   * Delete a lesson by ID
   * @param id The ID of the lesson to delete
   */
  deleteLesson(id: number): Observable<DeleteLessonResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<DeleteLessonResponse>(`${this.baseUrl}/${id}`, {headers: headers});
  }

  /**
   * Create a new lesson with exercises
   * @param lessonData The data for the new lesson
   */
  createLesson(lessonData: CreateLessonRequest): Observable<LessonResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<LessonResponse>(`${this.baseUrl}/create`, lessonData, {headers: headers});
  }
}

