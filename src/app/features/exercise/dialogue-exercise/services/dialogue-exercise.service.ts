import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DialogueExerciseCreateDto, DialogueExerciseUpdateDto } from '../models/dialogue-exercise.model';
import {BASE_LOCAL_URL, BASE_REMOTE_URL} from '../../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DialogueExerciseService {
  private baseUrl = `${BASE_LOCAL_URL}/api/dialogue-exercises`;

  constructor(private http: HttpClient) {}

  getDialogueExerciseByExerciseId(exerciseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-exercise/${exerciseId}`);
  }

  createDialogueExercise(dto: DialogueExerciseCreateDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  updateDialogueExercise(id: number, dto: DialogueExerciseUpdateDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }

  deleteDialogueExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
