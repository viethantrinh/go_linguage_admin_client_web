import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BASE_REMOTE_URL, BASE_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';
import {Topic} from '../models/topic.model';
import {ApiResponse} from '../../../core/models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private readonly BASE_URL = `${BASE_URL}/topics/admin`;
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

  createTopic(topicData: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<any>>(`${this.BASE_URL}/create`, topicData, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  uploadTopicImage(topicId: number, imageFile: File): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('topicId', topicId.toString());

    return this.http.post<ApiResponse<any>>(`${this.BASE_URL}/upload-image`, formData, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  getTopicDetail(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<any>>(`${this.BASE_URL}/${id}/detail`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  updateTopic(topicData: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<any>>(`${this.BASE_URL}/update`, topicData, { headers })
      .pipe(
        map(response => response.result)
      );
  }
}
