export interface Tratamiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  duracionEstimada: number; // En minutos
  costo: number;
  activo: boolean;
  requiereAutorizacion: boolean;
  observaciones?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TratamientoFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  duracionEstimada: number;
  costo: number;
  requiereAutorizacion: boolean;
  observaciones?: string;
}

export interface CategoriaTratamiento {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
}