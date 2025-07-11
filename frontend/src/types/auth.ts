// Authentication types that match your FastAPI backend

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  mobile_number: string;
  job_type?: string;
  gender: 'male' | 'female';
  role: 'viewer' | 'admin_hotel' | 'super_admin';
  hotel_id?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  mobile_number: string;
  job_type?: string;
  gender: 'male' | 'female';
  role?: 'viewer' | 'admin_hotel';
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
