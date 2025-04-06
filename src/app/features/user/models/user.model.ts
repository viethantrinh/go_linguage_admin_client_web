export interface UserRole {
  name: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  roles: UserRole[];
}

// For the update user request
export interface UserUpdateRequest {
  id: number;
  name: string;
  isEnabled: boolean;
  role: string;
}
