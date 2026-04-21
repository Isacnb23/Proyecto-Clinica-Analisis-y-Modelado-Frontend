export interface Rol {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioResumen {
  id: number;
  email: string;
  activo: boolean;
  rolId: number;
  rol: string;
}

export interface AssignRoleRequest {
  usuarioId: number;
  rolId: number;
}