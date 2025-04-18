import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
// Using window.location.origin as base URL since the environment file might not be accessible
import {WordArrangementExerciseRequest} from '../models/word-arrangement-exercise.model';
import {BASE_REMOTE_URL, TOKEN_KEY} from '../../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class WordArrangementExerciseService {
  private BASE_API_URL = BASE_REMOTE_URL;
  constructor(private http: HttpClient) { }

  // Get word arrangement exercise details by ID
  getWordArrangementExerciseDetail(exerciseId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<any>(`${this.BASE_API_URL}/exercises/word-arrangement/${exerciseId}`, { headers });
  }

  // Get sentences for a word arrangement exercise
  getSentences(exerciseId?: number): Observable<any> {
    const url = `${this.BASE_API_URL}/sentences/by-word-arrangement-exercise/${exerciseId}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<any>(url, { headers });
  }

  // Save word arrangement exercise (create or update)
  saveWordArrangementExercise(payload: WordArrangementExerciseRequest, isUpdate: boolean): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    if (isUpdate) {
      return this.http.put<any>(`${this.BASE_API_URL}/exercises/word-arrangement`, payload, { headers });
    } else {
      return this.http.post<any>(`${this.BASE_API_URL}/exercises/word-arrangement`, payload, { headers });
    }
  }


}
