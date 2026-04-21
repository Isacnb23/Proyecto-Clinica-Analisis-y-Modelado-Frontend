export interface EmpleadoApi {
  id: number;
  usuarioId?: number | null;
  codigo: string;
  nombre: string;
  apellidos: string;
  cedula: string;
  rolId: number;
  rol: string;
  especialidad?: string | null;
  codigoProfesional?: string | null;
  telefono: string;
  email: string;
  direccion?: string | null;
  fechaIngreso: string;
  activo: boolean;
  fechaRegistro: string;
  usuarioEmail?: string | null;
}

export interface EmpleadoCreateDto {
  usuarioId?: number | null;
  codigo: string;
  nombre: string;
  apellidos: string;
  cedula: string;
  rolId: number;
  especialidad?: string | null;
  codigoProfesional?: string | null;
  telefono: string;
  email: string;
  direccion?: string | null;
  fechaIngreso: string;
}

export interface EmpleadoUpdateDto extends EmpleadoCreateDto {
  activo?: boolean;
}