import {computed, inject, Injectable, signal} from '@angular/core';
import {
  BASE_LOCAL_URL,
  INTROSPECT_TOKEN_PATH,
  SIGN_IN_PATH,
  SIGN_OUT_PATH,
  SIGN_UP_PATH,
  TOKEN_KEY
} from '../../shared/utils/app.constants';
import {AuthResult, AuthState, IntrospectResponse} from '../../features/auth/models/auth.model';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, finalize, map, Observable, of, tap} from 'rxjs';
import {ApiResponse} from '../models/api-response.model';
import {APP_ROUTE_TOKEN} from '../routes/app.routes.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BASE_API_URL: string = BASE_LOCAL_URL;

  // State management with signals
  private authState = signal<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Exposed computed signals
  readonly token = computed(() => this.authState().token);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isLoading = computed(() => this.authState().isLoading);
  readonly error = computed(() => this.authState().error);

  // Services
  readonly #http = inject<HttpClient>(HttpClient);
  readonly #router = inject<Router>(Router);

  signIn(email: string, password: string): Observable<AuthResult | null> {
    // Set loading state
    this.authState.update(state => ({...state, isLoading: true, error: null}));

    return this.#http.post<ApiResponse<AuthResult>>(this.BASE_API_URL + SIGN_IN_PATH, {email, password})
      .pipe(
        map(response => {
          // Check if the response is successful based on the code
          if (response.code === 1000) {
            return response.result;
          } else {
            throw new Error(response.message || 'Failed to sign in');
          }
        }),
        tap(result => this.handleAuthSuccess(result.token)),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Failed to sign in';
          this.authState.update(state => ({
            ...state,
            error: errorMessage
          }));
          return of(null);
        }),
        finalize(() => {
          this.authState.update(state => ({...state, isLoading: false}));
        })
      );
  }

  signUp(name: string, email: string, password: string): Observable<AuthResult | null> {
    // Set loading state
    this.authState.update(state => ({...state, isLoading: true, error: null}));

    return this.#http.post<ApiResponse<AuthResult>>(this.BASE_API_URL + SIGN_UP_PATH, {
      name: name,
      email: email,
      password: password
    })
      .pipe(
        map(response => {
          // Check if the response is successful based on the code
          if (response.code === 1000) {
            return response.result;
          } else {
            throw new Error(response.message || 'Failed to sign up');
          }
        }),
        tap(result => this.handleAuthSuccess(result.token)),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Failed to sign up';
          this.authState.update(state => ({
            ...state,
            error: errorMessage
          }));
          return of(null);
        }),
        finalize(() => {
          this.authState.update(state => ({...state, isLoading: false}));
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
    this.authState.set({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    // Send API to backend to invalidate the token
    this.#http.post(this.BASE_API_URL + SIGN_OUT_PATH, {
      token: currentToken
    }).subscribe();

    // Navigate to login page
    this.#router.navigate(['/' + APP_ROUTE_TOKEN.AUTH]);
  }

  checkAuthStatus() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      this.#router.navigate(['/' + APP_ROUTE_TOKEN.AUTH]);
    }

    return this.#http.post<ApiResponse<IntrospectResponse>>(this.BASE_API_URL + INTROSPECT_TOKEN_PATH, {
      token: token
    }).pipe(
      map(response => {
        if (response.code === 1000) {
          return response.result;
        } else {
          throw new Error(response.message || 'Failed to validate token');
        }
      }),
      tap(ir => {
        if (ir.valid) {
          this.authState.set({
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          this.#router.navigate(['/' + APP_ROUTE_TOKEN.DASHBOARD]);
        } else {
          this.#router.navigate(['/' + APP_ROUTE_TOKEN.AUTH]);
        }
      }),
      catchError(() => {
        // If token validation fails, clear it
        localStorage.removeItem(TOKEN_KEY);
        this.authState.set({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        this.#router.navigate(['/' + APP_ROUTE_TOKEN.AUTH]);
        return of(null);
      }),
      finalize(() => {
        this.authState.update(state => ({...state, isLoading: false}));
      })
    );
  }

  private handleAuthSuccess(token: string): void {
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Update auth state with token
    this.authState.update(state => ({
      ...state,
      token,
      isAuthenticated: true
    }));

    // Navigate to dashboard
    this.#router.navigate(['/' + APP_ROUTE_TOKEN.DASHBOARD]);
  }
}
