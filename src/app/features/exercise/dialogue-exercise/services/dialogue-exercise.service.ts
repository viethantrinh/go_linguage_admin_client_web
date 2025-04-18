import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DialogueExerciseCreateDto, DialogueExerciseUpdateDto } from '../models/dialogue-exercise.model';
import { BASE_LOCAL_URL, BASE_REMOTE_URL, TOKEN_KEY } from '../../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DialogueExerciseService {
  private baseUrl = `${BASE_LOCAL_URL}/exercises/dialogue`;

  constructor(private http: HttpClient) {}

  getDialogueExerciseByExerciseId(exerciseId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<any>(`${this.baseUrl}/${exerciseId}`, { headers });
  }

  createDialogueExercise(dto: DialogueExerciseCreateDto): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<any>(this.baseUrl, dto, { headers });
  }

  updateDialogueExercise(dto: DialogueExerciseUpdateDto): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<any>(this.baseUrl, dto, { headers });
  }
}
