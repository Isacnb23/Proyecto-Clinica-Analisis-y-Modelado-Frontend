export interface Paciente {
  id: number;
  numeroExpediente: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  cedula: string;
  fechaNacimiento: Date;
  edad?: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  telefono: string;
  telefonoSecundario?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  estadoCivil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre';
  responsable?: Responsable;
  referencia?: string;
  alergias?: string;
  enfermedades?: string;
  medicamentos?: string;
  observaciones?: string;
  foto?: string;
  activo: boolean;
  fechaRegistro: Date;
  ultimaVisita?: Date;
}

export interface Responsable {
  nombre: string;
  parentesco: string;
  telefono: string;
  cedula?: string;
}

export interface PacienteFormData {
  // Datos personales
  nombre: string;
  apellido1: string;
  apellido2?: string;
  cedula: string;
  fechaNacimiento: Date;
  genero: string;
  telefono: string;
  telefonoSecundario?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  estadoCivil?: string;
  
  // Responsable (si es menor)
  esmenor?: boolean;
  responsableNombre?: string;
  responsableParentesco?: string;
  responsableTelefono?: string;
  responsableCedula?: string;
  
  // Datos médicos
  alergias?: string;
  enfermedades?: string;
  medicamentos?: string;
  observaciones?: string;
  referencia?: string;
}