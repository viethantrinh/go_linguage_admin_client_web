import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_LOCAL_URL, BASE_REMOTE_URL, TOKEN_KEY } from '../../../shared/utils/app.constants';
import {
  Sentence,
  SentenceResponse,
  SentenceDetailResponse,
  CreateSentenceRequest,
  UpdateSentenceRequest,
  DeleteSentenceResponse
} from '../models/sentence.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SentenceService {
  private readonly baseUrl = `${BASE_LOCAL_URL}/sentences`;

  constructor(private http: HttpClient) {
  }

  /**
   * Get all sentences
   */
  getSentences(): Observable<SentenceResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<SentenceResponse>(`${this.baseUrl}`, { headers: headers });
  }

  /**
   * Get sentence details by ID
   * @param id The ID of the sentence to retrieve
   */
  getSentenceById(id: number): Observable<SentenceDetailResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<SentenceDetailResponse>(`${this.baseUrl}/${id}`, { headers: headers });
  }

  /**
   * Create a new sentence
   * @param sentenceData The data for the new sentence
   */
  createSentence(sentenceData: CreateSentenceRequest): Observable<SentenceDetailResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<SentenceDetailResponse>(`${this.baseUrl}`, sentenceData, { headers: headers });
  }

  /**
   * Update an existing sentence
   * @param id The ID of the sentence to update
   * @param sentenceData The updated data for the sentence
   */
  updateSentence(id: number, sentenceData: UpdateSentenceRequest): Observable<SentenceDetailResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<SentenceDetailResponse>(`${this.baseUrl}/${id}`, sentenceData, { headers: headers });
  }

  /**
   * Delete a sentence by ID
   * @param id The ID of the sentence to delete
   */
  deleteSentence(id: number): Observable<DeleteSentenceResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<DeleteSentenceResponse>(`${this.baseUrl}/${id}`, { headers: headers });
  }
}
