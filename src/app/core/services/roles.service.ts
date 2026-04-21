import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssignRoleRequest, Rol, UsuarioResumen } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private rolesUrl = `${environment.apiUrl}/Roles`;
  private usuariosUrl = `${environment.apiUrl}/Usuarios`;

  private storageKey = 'clinica_role_permissions_demo';

  private defaultPermissions: Record<string, string[]> = {
    admin: [
      'dashboard.ver',
      'pacientes.ver', 'pacientes.crear', 'pacientes.editar',
      'citas.ver', 'citas.crear', 'citas.cancelar',
      'tratamientos.ver', 'tratamientos.crear',
      'empleados.ver', 'empleados.crear', 'empleados.editar',
      'inventario.ver', 'inventario.editar',
      'facturacion.ver', 'facturacion.pagar',
      'roles.ver', 'roles.asignar',
      'reportes.ver'
    ],
    odontologo: [
      'dashboard.ver',
      'pacientes.ver',
      'citas.ver', 'citas.crear',
      'tratamientos.ver', 'tratamientos.crear',
      'horarios.ver'
    ],
    asistente: [
      'dashboard.ver',
      'pacientes.ver',
      'citas.ver',
      'inventario.ver',
      'tratamientos.ver'
    ],
    recepcionista: [
      'dashboard.ver',
      'pacientes.ver', 'pacientes.crear',
      'citas.ver', 'citas.crear',
      'facturacion.ver'
    ]
  };

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }

  getUsuarios(): Observable<UsuarioResumen[]> {
    return this.http.get<UsuarioResumen[]>(this.usuariosUrl);
  }

  assignRole(payload: AssignRoleRequest): Observable<any> {
    return this.http.post(`${this.rolesUrl}/assign`, payload);
  }

  revokeRole(usuarioId: number): Observable<any> {
    return this.http.post(`${this.rolesUrl}/revoke/${usuarioId}`, {});
  }

  activateRole(id: number): Observable<any> {
    return this.http.patch(`${this.rolesUrl}/${id}/activate`, {});
  }

  deactivateRole(id: number): Observable<any> {
    return this.http.patch(`${this.rolesUrl}/${id}/deactivate`, {});
  }

  getAvailablePermissions(): string[] {
    return [
      'dashboard.ver',
      'pacientes.ver',
      'citas.ver',
      'tratamientos.ver',
      'empleados.ver',
      'empleados.crear',
      'empleados.editar',
      'roles.ver',
      'roles.asignar',
      'inventario.ver',
      'inventario.editar',
      'reportes.ver',
      'facturacion.ver',
      'facturacion.pagar'
    ];
  }

  getRolePermissions(roleName: string): string[] {
    const saved = localStorage.getItem(this.storageKey);
    const parsed = saved ? JSON.parse(saved) : {};
    const key = this.normalizeRoleName(roleName);

    return parsed[key] || this.defaultPermissions[key] || [];
  }

  saveRolePermissions(roleName: string, permissions: string[]): void {
    const saved = localStorage.getItem(this.storageKey);
    const parsed = saved ? JSON.parse(saved) : {};
    const key = this.normalizeRoleName(roleName);

    parsed[key] = permissions;
    localStorage.setItem(this.storageKey, JSON.stringify(parsed));
  }

  private normalizeRoleName(roleName: string): string {
    return roleName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}