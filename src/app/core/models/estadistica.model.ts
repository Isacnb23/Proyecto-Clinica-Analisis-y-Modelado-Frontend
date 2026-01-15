export interface EstadisticasDashboard {
  // Resumen general
  totalPacientes: number;
  pacientesActivos: number;
  citasHoy: number;
  citasSemana: number;
  tratamientosActivos: number;
  ingresosmes: number;
  
  // Gráficas
  citasPorMes: CitasPorMes[];
  tratamientosMasRealizados: TratamientoStat[];
  ingresosMensuales: IngresoMensual[];
  pacientesNuevosVsRecurrentes: PacientesStat;
  proximasCitas: CitaProxima[];
  alertasInventario: AlertaInventario[];
}

export interface CitasPorMes {
  mes: string;
  cantidad: number;
}

export interface TratamientoStat {
  nombre: string;
  cantidad: number;
  color: string;
}

export interface IngresoMensual {
  mes: string;
  ingresos: number;
}

export interface PacientesStat {
  nuevos: number;
  recurrentes: number;
}

export interface CitaProxima {
  id: number;
  paciente: string;
  tratamiento: string;
  fecha: Date;
  hora: string;
  odontologo: string;
}

export interface AlertaInventario {
  producto: string;
  stockActual: number;
  stockMinimo: number;
  urgencia: 'alta' | 'media' | 'baja';
}