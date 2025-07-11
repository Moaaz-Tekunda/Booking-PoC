export type Gender = 'male' | 'female';

export type Role = 'viewer' | 'admin_hotel' | 'super_admin';

export interface UserBase {
  name: string;
  email: string;
  age: number;
  mobile_number: string;
  job_type?: string;
  gender: Gender;
  role: Role;
  hotel_id?: string;
  is_active: boolean;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  age?: number;
  mobile_number?: string;
  job_type?: string;
  gender?: Gender;
  role?: Role;
  hotel_id?: string;
  is_active?: boolean;
}

export interface User extends UserBase {
  id: string;
  created_at: string;
  last_login?: string;
}

export interface UserResponse extends User {}

export interface UsersListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
