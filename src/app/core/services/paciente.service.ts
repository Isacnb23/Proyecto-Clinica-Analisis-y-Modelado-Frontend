import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Paciente, PacienteFormData } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:3000/api/pacientes';
  
  // Datos simulados (se reemplazan con API real después)
  private pacientesSubject = new BehaviorSubject<Paciente[]>(this.getPacientesMock());
  public pacientes$ = this.pacientesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener todos los pacientes
  getPacientes(): Observable<Paciente[]> {
    return this.pacientes$.pipe(delay(500)); // Simula delay de red
  }

  // Obtener paciente por ID
  getPacienteById(id: number): Observable<Paciente | undefined> {
    return this.pacientes$.pipe(
      map(pacientes => pacientes.find(p => p.id === id))
    );
  }

  // Buscar pacientes
  buscarPacientes(termino: string): Observable<Paciente[]> {
    return this.pacientes$.pipe(
      map(pacientes => 
        pacientes.filter(p => 
          p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          p.apellido1.toLowerCase().includes(termino.toLowerCase()) ||
          p.cedula.includes(termino) ||
          p.numeroExpediente.includes(termino)
        )
      ),
      delay(300)
    );
  }

  // Crear paciente
  crearPaciente(data: PacienteFormData): Observable<Paciente> {
    const pacientes = this.pacientesSubject.value;
    const nuevoId = Math.max(...pacientes.map(p => p.id), 0) + 1;
    
    const nuevoPaciente: Paciente = {
      id: nuevoId,
      numeroExpediente: this.generarNumeroExpediente(nuevoId),
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2,
      cedula: data.cedula,
      fechaNacimiento: data.fechaNacimiento,
      edad: this.calcularEdad(data.fechaNacimiento),
      genero: data.genero as any,
      telefono: data.telefono,
      telefonoSecundario: data.telefonoSecundario,
      email: data.email,
      direccion: data.direccion,
      ocupacion: data.ocupacion,
      estadoCivil: data.estadoCivil as any,
      responsable: data.esmenor ? {
        nombre: data.responsableNombre!,
        parentesco: data.responsableParentesco!,
        telefono: data.responsableTelefono!,
        cedula: data.responsableCedula
      } : undefined,
      alergias: data.alergias,
      enfermedades: data.enfermedades,
      medicamentos: data.medicamentos,
      observaciones: data.observaciones,
      referencia: data.referencia,
      activo: true,
      fechaRegistro: new Date()
    };

    const nuevaLista = [...pacientes, nuevoPaciente];
    this.pacientesSubject.next(nuevaLista);
    
    return of(nuevoPaciente).pipe(delay(500));
  }

  // Actualizar paciente
  actualizarPaciente(id: number, data: PacienteFormData): Observable<Paciente> {
    const pacientes = this.pacientesSubject.value;
    const index = pacientes.findIndex(p => p.id === id);
    
    if (index !== -1) {
      const pacienteActualizado: Paciente = {
        ...pacientes[index],
        nombre: data.nombre,
        apellido1: data.apellido1,
        apellido2: data.apellido2,
        cedula: data.cedula,
        fechaNacimiento: data.fechaNacimiento,
        edad: this.calcularEdad(data.fechaNacimiento),
        genero: data.genero as any,
        telefono: data.telefono,
        telefonoSecundario: data.telefonoSecundario,
        email: data.email,
        direccion: data.direccion,
        ocupacion: data.ocupacion,
        estadoCivil: data.estadoCivil as any,
        responsable: data.esmenor ? {
          nombre: data.responsableNombre!,
          parentesco: data.responsableParentesco!,
          telefono: data.responsableTelefono!,
          cedula: data.responsableCedula
        } : undefined,
        alergias: data.alergias,
        enfermedades: data.enfermedades,
        medicamentos: data.medicamentos,
        observaciones: data.observaciones,
        referencia: data.referencia
      };

      const nuevaLista = [...pacientes];
      nuevaLista[index] = pacienteActualizado;
      this.pacientesSubject.next(nuevaLista);
      
      return of(pacienteActualizado).pipe(delay(500));
    }
    
    throw new Error('Paciente no encontrado');
  }

  // Eliminar (desactivar) paciente
  eliminarPaciente(id: number): Observable<boolean> {
    const pacientes = this.pacientesSubject.value;
    const index = pacientes.findIndex(p => p.id === id);
    
    if (index !== -1) {
      const nuevaLista = [...pacientes];
      nuevaLista[index] = { ...nuevaLista[index], activo: false };
      this.pacientesSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }
    
    return of(false);
  }

  // Activar paciente
  activarPaciente(id: number): Observable<boolean> {
    const pacientes = this.pacientesSubject.value;
    const index = pacientes.findIndex(p => p.id === id);
    
    if (index !== -1) {
      const nuevaLista = [...pacientes];
      nuevaLista[index] = { ...nuevaLista[index], activo: true };
      this.pacientesSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }
    
    return of(false);
  }

  // Helpers
  private generarNumeroExpediente(id: number): string {
    return `EXP-${String(id).padStart(6, '0')}`;
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  // Datos mock para pruebas
  private getPacientesMock(): Paciente[] {
    return [
      {
        id: 1,
        numeroExpediente: 'EXP-000001',
        nombre: 'María',
        apellido1: 'González',
        apellido2: 'Pérez',
        cedula: '1-1234-5678',
        fechaNacimiento: new Date('1990-05-15'),
        edad: 34,
        genero: 'Femenino',
        telefono: '8888-1234',
        email: 'maria.gonzalez@email.com',
        direccion: 'San José, Costa Rica',
        ocupacion: 'Ingeniera',
        estadoCivil: 'Casado',
        alergias: 'Penicilina',
        activo: true,
        fechaRegistro: new Date('2024-01-15'),
        ultimaVisita: new Date('2024-11-20')
      },
      {
        id: 2,
        numeroExpediente: 'EXP-000002',
        nombre: 'Carlos',
        apellido1: 'Rodríguez',
        apellido2: 'Mora',
        cedula: '2-2345-6789',
        fechaNacimiento: new Date('1985-08-22'),
        edad: 39,
        genero: 'Masculino',
        telefono: '8888-5678',
        email: 'carlos.rodriguez@email.com',
        direccion: 'Heredia, Costa Rica',
        ocupacion: 'Contador',
        enfermedades: 'Diabetes tipo 2',
        medicamentos: 'Metformina',
        activo: true,
        fechaRegistro: new Date('2024-02-10'),
        ultimaVisita: new Date('2024-12-01')
      },
      {
        id: 3,
        numeroExpediente: 'EXP-000003',
        nombre: 'Ana',
        apellido1: 'Martínez',
        apellido2: 'López',
        cedula: '3-3456-7890',
        fechaNacimiento: new Date('2015-03-10'),
        edad: 9,
        genero: 'Femenino',
        telefono: '8888-9012',
        direccion: 'Alajuela, Costa Rica',
        responsable: {
          nombre: 'Laura López Jiménez',
          parentesco: 'Madre',
          telefono: '8888-9013',
          cedula: '1-0987-6543'
        },
        activo: true,
        fechaRegistro: new Date('2024-03-05')
      },
      {
        id: 4,
        numeroExpediente: 'EXP-000004',
        nombre: 'Roberto',
        apellido1: 'Fernández',
        cedula: '4-4567-8901',
        fechaNacimiento: new Date('1978-11-30'),
        edad: 46,
        genero: 'Masculino',
        telefono: '8888-3456',
        email: 'roberto.fernandez@email.com',
        ocupacion: 'Médico',
        estadoCivil: 'Divorciado',
        activo: true,
        fechaRegistro: new Date('2024-04-12')
      },
      {
        id: 5,
        numeroExpediente: 'EXP-000005',
        nombre: 'Sofía',
        apellido1: 'Vargas',
        apellido2: 'Castro',
        cedula: '5-5678-9012',
        fechaNacimiento: new Date('1995-07-18'),
        edad: 29,
        genero: 'Femenino',
        telefono: '8888-7890',
        email: 'sofia.vargas@email.com',
        direccion: 'Cartago, Costa Rica',
        ocupacion: 'Diseñadora',
        estadoCivil: 'Soltero',
        activo: true,
        fechaRegistro: new Date('2024-05-20'),
        ultimaVisita: new Date('2024-11-25')
      }
    ];
  }
}