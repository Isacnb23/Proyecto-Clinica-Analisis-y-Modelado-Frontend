import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  email: string;
  rolId: number;
  rol?: string;           // nombre del rol que devuelve el backend
  rolNombre?: string;
  activo: boolean;
  fechaRegistro?: string;
}

// ✅ Coincide con RegisterRequestDTO del backend
export interface UsuarioCreate {
  email: string;
  password: string;
  confirmPassword: string;  // requerido por el backend
  rolId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuarios`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios (opcionalmente filtrar por rol)
  getUsuarios(rol?: string): Observable<Usuario[]> {
    const params = rol ? `?rol=${rol}` : '';
    return this.http.get<Usuario[]>(`${this.apiUrl}${params}`);
  }

  // ✅ Crear usuario — body coincide con RegisterRequestDTO del backend
  crearUsuario(data: UsuarioCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // ✅ Activar usuario
  activarUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {});
  }

  // ✅ Desactivar usuario (PATCH, no DELETE)
  desactivarUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivar`, {});
  }
}