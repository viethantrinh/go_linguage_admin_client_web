export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResult {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
}

