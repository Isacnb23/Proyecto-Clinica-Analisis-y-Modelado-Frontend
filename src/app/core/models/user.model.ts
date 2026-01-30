export interface User {
  id: number;
  email: string;
  rol: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expiration?: string;
  user?: User;
}
