export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  odontologoId: number;
  odontologoNombre: string;
  tratamientoId: number;
  tratamientoNombre: string;
  fecha: Date;
  hora: string;
  duracion: number; // En minutos
  estado: EstadoCita;
  motivo?: string;
  observaciones?: string;
  costo?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface CitaFormData {
  pacienteId: number;
  odontologoId: number;
  tratamientoId: number;
  fecha: Date;
  hora: string;
  duracion: number;
  motivo?: string;
  observaciones?: string;
}

export interface Odontologo {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

export interface Tratamiento {
  id: number;
  nombre: string;
  descripcion?: string;
  duracionEstimada: number; // En minutos
  costo: number;
  activo: boolean;
}

export interface HorarioDisponible {
  fecha: Date;
  horasDisponibles: string[];
}