// Modelo que coincide con TratamientoResponseDTO del backend
export interface Tratamiento {
  id: number;

  // Relaciones
  pacienteId: number;
  pacienteNombre?: string;
  empleadoId: number;
  empleadoNombre?: string;

  // Datos del tratamiento
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  estadoId: number;

  // Fechas
  fechaInicio: string;
  fechaEstimadaFin?: string;
  fechaCreacion: string;
  ultimaModificacion: string;

  // Sesiones
  numeroSesiones: number;
  sesionesCompletadas: number;

  // Financiero (campos reales del backend)
  costoTotal: number;
  costoMateriales: number;
  montoPagado: number;
  saldo: number;

  // Campos legacy (para compatibilidad con template existente)
  costo?: number;          // alias de costoTotal
  codigo?: string;         // no viene del backend, opcional
  activo?: boolean;        // calculado: saldo no === cancelado
  duracionEstimada?: number;
  requiereAutorizacion?: boolean;
  categoriaNombre?: string;
  observaciones?: string;
}

export interface TratamientoFormData {
  pacienteId: number;
  empleadoId: number;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  fechaInicio: string;
  costoTotal: number;
  numeroSesiones: number;
  estadoId: number;
  notas?: string;
}

export interface CategoriaTratamiento {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
}