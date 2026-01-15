export interface Empleado {
  id: number;
  codigo: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  cedula: string;
  fechaNacimiento: Date;
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  
  // Contacto
  telefono: string;
  email: string;
  direccion?: string;
  
  // Laboral
  rol: RolEmpleado;
  especialidad?: string;
  numeroLicencia?: string; // Para odontólogos
  fechaContratacion: Date;
  salario: number;
  
  // Horario
  horarioTrabajo: HorarioTrabajo;
  
  // Estado
  activo: boolean;
  observaciones?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt?: Date;
}

export type RolEmpleado = 'Administrador' | 'Odontólogo' | 'Asistente' | 'Recepcionista';

export interface HorarioTrabajo {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

export interface HorarioDia {
  trabaja: boolean;
  horaEntrada?: string;
  horaSalida?: string;
}

export interface EmpleadoFormData {
  codigo: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  cedula: string;
  fechaNacimiento: Date;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  telefono: string;
  email: string;
  direccion?: string;
  rol: RolEmpleado;
  especialidad?: string;
  numeroLicencia?: string;
  fechaContratacion: Date;
  salario: number;
  observaciones?: string;
}

export interface EstadisticasEmpleados {
  totalEmpleados: number;
  empleadosActivos: number;
  porRol: {
    administradores: number;
    odontologos: number;
    asistentes: number;
    recepcionistas: number;
  };
}