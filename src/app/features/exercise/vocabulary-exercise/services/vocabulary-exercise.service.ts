import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BASE_REMOTE_URL, BASE_URL, TOKEN_KEY} from '../../../../shared/utils/app.constants';
import {VocabularyExerciseDetail, VocabularyExerciseRequest, VocabularyWord} from '../models/vocabulary-exercise.model';
import {ApiResponse} from '../../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class VocabularyExerciseService {
  private readonly baseUrl = `${BASE_URL}`;

  constructor(private http: HttpClient) {}

  /**
   * Get vocabulary words by exercise ID
   * @param exerciseId The exercise ID
   */
  getVocabularyWordsByExerciseId(exerciseId: number): Observable<ApiResponse<VocabularyWord[]>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<VocabularyWord[]>>(`${this.baseUrl}/words/by-vocabulary-exercise/${exerciseId}`, { headers });
  }

  /**
   * Get vocabulary exercise details
   * @param exerciseId The exercise ID
   */
  getVocabularyExerciseDetail(exerciseId: number): Observable<ApiResponse<VocabularyExerciseDetail>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<VocabularyExerciseDetail>>(`${this.baseUrl}/exercises/vocabulary/${exerciseId}`, { headers });
  }

  /**
   * Create or update vocabulary exercise
   * @param payload The request payload
   * @param isUpdate Whether this is an update or create operation
   */
  saveVocabularyExercise(payload: VocabularyExerciseRequest, isUpdate: boolean): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    if (isUpdate) {
      return this.http.put<ApiResponse<any>>(`${this.baseUrl}/exercises/vocabulary`, payload, { headers });
    } else {
      return this.http.post<ApiResponse<any>>(`${this.baseUrl}/exercises/vocabulary`, payload, { headers });
    }
  }
}
