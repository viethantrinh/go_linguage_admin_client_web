import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiResponse} from '../../../core/models/api-response.model';
import {BASE_LOCAL_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';
import {
  Conversation,
  ConversationCreateDto,
  ConversationList,
  ConversationUpdateDto
} from '../models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = `${BASE_LOCAL_URL}/conversations`;

  constructor(private http: HttpClient) { }

  // Get all conversations (paginated)
  getConversations(page: number = 1, limit: number = 10): Observable<{ items: ConversationList[], totalCount: number }> {
    // This endpoint doesn't have pagination yet, so we'll handle it client-side
    return this.getAllConversations().pipe(
      map(conversations => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return {
          items: conversations.slice(startIndex, endIndex),
          totalCount: conversations.length
        };
      })
    );
  }

  // Get all conversations without pagination (for admin displays)
  getAllConversations(): Observable<ConversationList[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<ConversationList[]>>(`${this.apiUrl}/all`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Get a single conversation by ID
  getConversationById(id: number): Observable<Conversation> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<Conversation>>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Create a new conversation
  createConversation(conversationData: ConversationCreateDto): Observable<Conversation> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.post<ApiResponse<Conversation>>(this.apiUrl, conversationData, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Update an existing conversation
  updateConversation(conversation: ConversationUpdateDto): Observable<Conversation> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<Conversation>>(`${this.apiUrl}/${conversation.id}`, conversation, { headers })
      .pipe(
        map(response => response.result)
      );
  }

  // Delete a conversation
  deleteConversation(id: number): Observable<boolean> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(response => response.code === 1000)
      );
  }

  // Upload audio file
  uploadAudio(file: File): Observable<string> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/upload-audio`, formData, { headers })
      .pipe(
        map(response => response.result)
      );
  }
}
