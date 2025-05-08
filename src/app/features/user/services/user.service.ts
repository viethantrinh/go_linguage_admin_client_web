import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {User, UserUpdateRequest} from '../models/user.model';
import {ApiResponse} from '../../../core/models/api-response.model';
import {BASE_REMOTE_URL, BASE_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private BASE_URL = `${BASE_URL}/users/admin`;
  readonly http = inject(HttpClient);

  /**
   * Get list of all users
   */
  getUsers(): Observable<User[]> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<User[]>>(`${this.BASE_URL}/list`, {headers: headers})
      .pipe(
        map(response => response.result)
      );
  }

  /**
   * Get user details by ID
   */
  getUserById(id: number): Observable<User> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<User>>(`${this.BASE_URL}/${id}`, {headers: headers})
      .pipe(
        map(response => response.result)
      );
  }

  /**
   * Update user information
   */
  updateUser(user: UserUpdateRequest): Observable<User> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.put<ApiResponse<User>>(`${this.BASE_URL}/update`, user, {headers: headers})
      .pipe(
        map(response => response.result)
      );
  }

  /**
   * Delete user by ID
   */
  deleteUser(id: number): Observable<void> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`, {headers: headers})
      .pipe(
        map(() => undefined)
      );
  }
}
