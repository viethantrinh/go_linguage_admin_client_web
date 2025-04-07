import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BASE_REMOTE_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';

// Define Topic model to match API response
export interface Topic {
  id: number;
  name: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
  isPremium: boolean;
}

// Define API response structure
interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: string;
  result: T;
}

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private readonly BASE_URL = `${BASE_REMOTE_URL}/topics/admin`;
  private readonly http = inject(HttpClient);

  /**
   * Get list of all topics
   */
  getTopics(): Observable<Topic[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    return this.http.get<ApiResponse<Topic[]>>(`${this.BASE_URL}/list`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  /**
   * Delete topic by ID
   */
  deleteTopic(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`, { headers });
  }
}
