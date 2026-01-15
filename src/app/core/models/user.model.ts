export interface User {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
  rol: Role;
  token?: string;
}

export interface Role {
  id: number;
  nombre: string;
  permisos: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}