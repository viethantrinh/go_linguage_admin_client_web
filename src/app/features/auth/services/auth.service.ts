import {inject, Injectable, signal} from '@angular/core';
import {
  BASE_REMOTE_URL,
  INTROSPECT_TOKEN_PATH,
  SIGN_IN_PATH,
  SIGN_OUT_PATH,
  SIGN_UP_PATH,
  TOKEN_KEY
} from '../../../shared/utils/app.constants';
import {AuthResult, IntrospectResponse} from '../models/auth.model';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, finalize, Observable, of, tap} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {APP_ROUTE_TOKEN} from '../../../core/routes/app.routes.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BASE_API_URL: string = BASE_REMOTE_URL;

  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | undefined>(undefined);

  // Services
  readonly http = inject<HttpClient>(HttpClient);
  readonly router = inject<Router>(Router);

  signIn(email: string, password: string): Observable<ApiResponse<AuthResult> | null> {
    // Set loading state
    this.isLoading.set(true);

    return this.http.post<ApiResponse<AuthResult>>(this.BASE_API_URL + SIGN_IN_PATH, {email, password})
      .pipe(
        tap((response) => {
          let token = response.result.token;
          localStorage.setItem(TOKEN_KEY, token);
          this.router.navigate([`/${APP_ROUTE_TOKEN.DASHBOARD}`]).then();
        }),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Failed to sign in';
          this.errorMessage.set(errorMessage);
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      );
  }

  signUp(name: string, email: string, password: string): Observable<ApiResponse<AuthResult> | null> {
    // Set loading state
    this.isLoading.set(true);

    return this.http.post<ApiResponse<AuthResult>>(this.BASE_API_URL + SIGN_UP_PATH, {name, email, password})
      .pipe(
        tap(response => {
          // Check if the response is successful based on the code
          let token = response.result.token;
          localStorage.setItem(TOKEN_KEY, token);
        }),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Failed to sign up';
          this.errorMessage.set(errorMessage);
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      );
  }

  signOut(): void {
    const currentToken = localStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      return;
    }

    // Clear token from localStorage
    localStorage.removeItem(TOKEN_KEY);

    // Reset auth state
    this.isAuthenticated.set(false);

    // Send API to backend to invalidate the token
    this.http.post(this.BASE_API_URL + SIGN_OUT_PATH, {
      token: currentToken
    }).subscribe();

    // Navigate to login page
    this.router.navigate(['/' + APP_ROUTE_TOKEN.AUTH]).then();
  }

  checkAuthStatus(): Observable<ApiResponse<IntrospectResponse> | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      this.isAuthenticated.set(false);
    }

    return this.http.post<ApiResponse<IntrospectResponse>>(this.BASE_API_URL + INTROSPECT_TOKEN_PATH, {
      token: token
    }).pipe(
      tap(response => {
        // Check if the response is successful based on the code
        let isValid = response.result.valid;
        if (isValid) {
          this.isAuthenticated.set(true);
        } else {
          this.router.navigate([`/${APP_ROUTE_TOKEN.AUTH}`]).then();
          this.isAuthenticated.set(false);
        }
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to introspect';
        this.errorMessage.set(errorMessage);
        localStorage.removeItem(TOKEN_KEY);
        this.isAuthenticated.set(false);
        this.router.navigate([`/${APP_ROUTE_TOKEN.AUTH}`]).then();
        return of(null);
      }),
    );
  }
}
