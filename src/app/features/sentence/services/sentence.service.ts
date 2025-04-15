import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BASE_LOCAL_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';
import {Sentence, SentencePayload, Topic, Word} from '../models/sentence.model';
import {ApiResponse} from '../../../core/models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class SentenceService {
  private apiUrl = BASE_LOCAL_URL;

  constructor(private http: HttpClient) { }

  // Get all sentences
  getAllSentences(): Observable<Sentence[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Sentence[]>>(`${this.apiUrl}/sentences`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Get sentence by ID
  getSentenceById(id: number): Observable<Sentence> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Sentence>>(`${this.apiUrl}/sentences/${id}`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Create a new sentence
  createSentence(sentence: SentencePayload): Observable<Sentence> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<Sentence>>(`${this.apiUrl}/sentences`, sentence, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Update an existing sentence
  updateSentence(id: number, sentence: SentencePayload): Observable<Sentence> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<Sentence>>(`${this.apiUrl}/sentences/${id}`, sentence, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Delete a sentence
  deleteSentence(id: number): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/sentences/${id}`, { headers });
  }

  // Get all topics
  getAllTopics(): Observable<Topic[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Topic[]>>(`${this.apiUrl}/topics`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Get all words
  getAllWords(): Observable<Word[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Word[]>>(`${this.apiUrl}/words`, { headers })
      .pipe(
        map(response => response.result)
      );
  }
}
