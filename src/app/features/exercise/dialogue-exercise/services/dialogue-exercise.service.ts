import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DialogueExerciseCreateDto, DialogueExerciseUpdateDto } from '../models/dialogue-exercise.model';
import { BASE_LOCAL_URL, BASE_REMOTE_URL, TOKEN_KEY } from '../../../../shared/utils/app.constants';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DialogueExerciseService {
  private baseUrl = `${BASE_LOCAL_URL}/exercises/dialogue`;

  constructor(private http: HttpClient) {}

  getDialogueExerciseByExerciseId(exerciseId: number): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${exerciseId}`, { headers });
  }

  createDialogueExercise(dto: DialogueExerciseCreateDto): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto, { headers });
  }

  updateDialogueExercise(dto: DialogueExerciseUpdateDto): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<any>>(this.baseUrl, dto, { headers });
  }
}
