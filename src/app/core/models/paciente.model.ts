export interface Paciente {
  id: number;
  nombre: string;
  apellidos: string;
  cedula: string;
  fecha_nacimiento: string;
  genero_id: number;
  telefono: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  estadoCivil?: string;
  alergias?: string;
  enfermedades_cronicas?: string;
  medicamentos?: string;
  observaciones?: string;
  referencia?: string;
  tipo_sangre?: string;
  nombre_emergencia?: string;
  telefono_emergencia?: string;
  relacion_emergencia?: string;
  activo: boolean;
  fecha_registro: Date;
  ultima_modifcacion?: Date;
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
