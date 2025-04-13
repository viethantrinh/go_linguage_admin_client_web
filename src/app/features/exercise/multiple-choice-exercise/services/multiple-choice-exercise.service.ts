import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { BASE_LOCAL_URL, BASE_REMOTE_URL, TOKEN_KEY } from '../../../../shared/utils/app.constants';
import {
  MultipleChoiceExerciseDetail,
  MultipleChoiceExerciseRequest,
  Sentence,
  Word
} from '../models/multiple-choice-exercise.model';

@Injectable({
  providedIn: 'root'
})
export class MultipleChoiceExerciseService {
  private readonly baseUrl = `${BASE_REMOTE_URL}`;

  constructor(private http: HttpClient) { }

  /**
   * Get multiple choice exercise details
   * @param exerciseId The exercise ID
   */
  getMultipleChoiceExerciseDetail(exerciseId: number): Observable<ApiResponse<MultipleChoiceExerciseDetail>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<MultipleChoiceExerciseDetail>>(
      `${this.baseUrl}/exercises/multiple-choice/${exerciseId}`,
      { headers }
    );
  }

  /**
   * Get words for multiple choice questions/options based on exercise ID
   * @param exerciseId The exercise ID
   */
  getWords(exerciseId: number): Observable<ApiResponse<Word[]>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Word[]>>(
      `${this.baseUrl}/words/by-multiple-choice-exercise/${exerciseId}`,
      { headers }
    );
  }

  /**
   * Get sentences for multiple choice questions/options based on exercise ID
   * @param exerciseId The exercise ID
   */
  getSentences(exerciseId: number): Observable<ApiResponse<Sentence[]>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Sentence[]>>(
      `${this.baseUrl}/sentences/by-multiple-choice-exercise/${exerciseId}`,
      { headers }
    );
  }

  /**
   * Create or update multiple choice exercise
   * @param payload The request payload
   * @param isUpdate Whether this is an update or create operation
   */
  saveMultipleChoiceExercise(
    payload: MultipleChoiceExerciseRequest,
    isUpdate: boolean
  ): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    if (isUpdate) {
      return this.http.put<ApiResponse<any>>(
        `${this.baseUrl}/exercises/multiple-choice`,
        payload,
        { headers }
      );
    } else {
      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}/exercises/multiple-choice`,
        payload,
        { headers }
      );
    }
  }
}
