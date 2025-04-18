import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BASE_LOCAL_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';
import {ApiResponse} from '../../../core/models/api-response.model';
import {
  CreateWordRequest,
  SentenceListResponse,
  TopicListResponse,
  UpdateWordRequest,
  UploadImageResponse,
  WordListResponse,
  WordResponse
} from '../models/word.model';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private readonly baseUrl = `${BASE_LOCAL_URL}`;

  constructor(private http: HttpClient) {}

  /**
   * Get all words
   */
  getWords(): Observable<WordListResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<WordListResponse>(`${this.baseUrl}/words`, { headers });
  }

  /**
   * Get word details by ID
   * @param id The ID of the word to retrieve
   */
  getWordDetail(id: number): Observable<WordResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<WordResponse>(`${this.baseUrl}/words/${id}`, { headers });
  }

  /**
   * Create a new word
   * @param wordData The data for the new word
   */
  createWord(wordData: CreateWordRequest): Observable<WordResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<WordResponse>(`${this.baseUrl}/words`, wordData, { headers });
  }

  /**
   * Update a word by ID
   * @param id The ID of the word to update
   * @param wordData The updated word data
   */
  updateWord(id: number, wordData: UpdateWordRequest): Observable<WordResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<WordResponse>(`${this.baseUrl}/words/${id}`, wordData, { headers });
  }

  /**
   * Delete a word by ID
   * @param id The ID of the word to delete
   */
  deleteWord(id: number): Observable<ApiResponse<void>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/words/${id}`, { headers });
  }

  /**
   * Upload an image for a word
   * @param wordId The ID of the word
   * @param file The image file to upload
   */
  uploadImage(wordId: number, file: File): Observable<ApiResponse<UploadImageResponse>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wordId', wordId.toString());

    return this.http.post<ApiResponse<UploadImageResponse>>(
      `${this.baseUrl}/words/upload-image`,
      formData,
      { headers }
    );
  }

  /**
   * Get all topics
   */
  getTopics(): Observable<TopicListResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<TopicListResponse>(`${this.baseUrl}/topics`, { headers });
  }

  /**
   * Get all sentences
   */
  getSentences(): Observable<SentenceListResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<SentenceListResponse>(`${this.baseUrl}/sentences`, { headers });
  }
}
