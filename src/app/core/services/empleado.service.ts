import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Empleado, EmpleadoFormData, EstadisticasEmpleados, HorarioTrabajo } from '../models/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private empleadosSubject = new BehaviorSubject<Empleado[]>(this.getEmpleadosMock());
  public empleados$ = this.empleadosSubject.asObservable();

  constructor() {}

  // Obtener todos los empleados
  getEmpleados(): Observable<Empleado[]> {
    return this.empleados$.pipe(delay(500));
  }

  // Obtener empleado por ID
  getEmpleadoById(id: number): Observable<Empleado | undefined> {
    return this.empleados$.pipe(
      map(empleados => empleados.find(e => e.id === id))
    );
  }

  // Obtener empleados por rol
  getEmpleadosByRol(rol: Empleado['rol']): Observable<Empleado[]> {
    return this.empleados$.pipe(
      map(empleados => empleados.filter(e => e.rol === rol && e.activo))
    );
  }

  // Buscar empleados
  buscarEmpleados(termino: string): Observable<Empleado[]> {
    return this.empleados$.pipe(
      map(empleados => 
        empleados.filter(e => 
          e.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          e.apellido1.toLowerCase().includes(termino.toLowerCase()) ||
          e.cedula.includes(termino) ||
          e.codigo.toLowerCase().includes(termino.toLowerCase())
        )
      ),
      delay(300)
    );
  }

  // Crear empleado
  crearEmpleado(data: EmpleadoFormData): Observable<Empleado> {
    const empleados = this.empleadosSubject.value;
    const nuevoId = Math.max(...empleados.map(e => e.id), 0) + 1;

    const nuevoEmpleado: Empleado = {
      id: nuevoId,
      codigo: data.codigo,
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2,
      cedula: data.cedula,
      fechaNacimiento: data.fechaNacimiento,
      edad: this.calcularEdad(data.fechaNacimiento),
      genero: data.genero,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
      rol: data.rol,
      especialidad: data.especialidad,
      numeroLicencia: data.numeroLicencia,
      fechaContratacion: data.fechaContratacion,
      salario: data.salario,
      horarioTrabajo: this.getHorarioDefault(),
      activo: true,
      observaciones: data.observaciones,
      createdAt: new Date()
    };

    const nuevaLista = [...empleados, nuevoEmpleado];
    this.empleadosSubject.next(nuevaLista);

    return of(nuevoEmpleado).pipe(delay(500));
  }

  // Actualizar empleado
  actualizarEmpleado(id: number, data: EmpleadoFormData): Observable<Empleado> {
    const empleados = this.empleadosSubject.value;
    const index = empleados.findIndex(e => e.id === id);

    if (index !== -1) {
      const empleadoActualizado: Empleado = {
        ...empleados[index],
        codigo: data.codigo,
        nombre: data.nombre,
        apellido1: data.apellido1,
        apellido2: data.apellido2,
        cedula: data.cedula,
        fechaNacimiento: data.fechaNacimiento,
        edad: this.calcularEdad(data.fechaNacimiento),
        genero: data.genero,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        rol: data.rol,
        especialidad: data.especialidad,
        numeroLicencia: data.numeroLicencia,
        fechaContratacion: data.fechaContratacion,
        salario: data.salario,
        observaciones: data.observaciones,
        updatedAt: new Date()
      };

      const nuevaLista = [...empleados];
      nuevaLista[index] = empleadoActualizado;
      this.empleadosSubject.next(nuevaLista);

      return of(empleadoActualizado).pipe(delay(500));
    }

    throw new Error('Empleado no encontrado');
  }

  // Eliminar (desactivar) empleado
  eliminarEmpleado(id: number): Observable<boolean> {
    const empleados = this.empleadosSubject.value;
    const index = empleados.findIndex(e => e.id === id);

    if (index !== -1) {
      const nuevaLista = [...empleados];
      nuevaLista[index] = { ...nuevaLista[index], activo: false };
      this.empleadosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Activar empleado
  activarEmpleado(id: number): Observable<boolean> {
    const empleados = this.empleadosSubject.value;
    const index = empleados.findIndex(e => e.id === id);

    if (index !== -1) {
      const nuevaLista = [...empleados];
      nuevaLista[index] = { ...nuevaLista[index], activo: true };
      this.empleadosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<EstadisticasEmpleados> {
    return this.empleados$.pipe(
      map(empleados => {
        const activos = empleados.filter(e => e.activo);
        return {
          totalEmpleados: empleados.length,
          empleadosActivos: activos.length,
          porRol: {
            administradores: empleados.filter(e => e.rol === 'Administrador').length,
            odontologos: empleados.filter(e => e.rol === 'Odontólogo').length,
            asistentes: empleados.filter(e => e.rol === 'Asistente').length,
            recepcionistas: empleados.filter(e => e.rol === 'Recepcionista').length
          }
        };
      })
    );
  }

  // Helpers
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

  private getHorarioDefault(): HorarioTrabajo {
    return {
      lunes: { trabaja: true, horaEntrada: '08:00', horaSalida: '17:00' },
      martes: { trabaja: true, horaEntrada: '08:00', horaSalida: '17:00' },
      miercoles: { trabaja: true, horaEntrada: '08:00', horaSalida: '17:00' },
      jueves: { trabaja: true, horaEntrada: '08:00', horaSalida: '17:00' },
      viernes: { trabaja: true, horaEntrada: '08:00', horaSalida: '17:00' },
      sabado: { trabaja: false },
      domingo: { trabaja: false }
    };
  }

  // Datos mock
  private getEmpleadosMock(): Empleado[] {
    return [
      {
        id: 1,
        codigo: 'EMP-001',
        nombre: 'Juan',
        apellido1: 'Pérez',
        apellido2: 'González',
        cedula: '1-1234-5678',
        fechaNacimiento: new Date('1985-05-15'),
        edad: 39,
        genero: 'Masculino',
        telefono: '8888-1234',
        email: 'juan.perez@clinicapca.com',
        direccion: 'San José, Escazú',
        rol: 'Odontólogo',
        especialidad: 'Odontología General',
        numeroLicencia: 'MED-12345',
        fechaContratacion: new Date('2020-03-01'),
        salario: 1500000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2020-03-01')
      },
      {
        id: 2,
        codigo: 'EMP-002',
        nombre: 'Ana',
        apellido1: 'Mora',
        apellido2: 'Jiménez',
        cedula: '2-2345-6789',
        fechaNacimiento: new Date('1990-08-20'),
        edad: 34,
        genero: 'Femenino',
        telefono: '8888-5678',
        email: 'ana.mora@clinicapca.com',
        direccion: 'Heredia, San Rafael',
        rol: 'Odontólogo',
        especialidad: 'Ortodoncia',
        numeroLicencia: 'MED-67890',
        fechaContratacion: new Date('2021-06-15'),
        salario: 1600000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2021-06-15')
      },
      {
        id: 3,
        codigo: 'EMP-003',
        nombre: 'Carlos',
        apellido1: 'Solís',
        apellido2: 'Vargas',
        cedula: '3-3456-7890',
        fechaNacimiento: new Date('1982-12-10'),
        edad: 42,
        genero: 'Masculino',
        telefono: '8888-9012',
        email: 'carlos.solis@clinicapca.com',
        direccion: 'Alajuela, Centro',
        rol: 'Odontólogo',
        especialidad: 'Endodoncia',
        numeroLicencia: 'MED-11223',
        fechaContratacion: new Date('2019-01-10'),
        salario: 1700000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2019-01-10')
      },
      {
        id: 4,
        codigo: 'EMP-004',
        nombre: 'María',
        apellido1: 'Jiménez',
        apellido2: 'Rojas',
        cedula: '4-4567-8901',
        fechaNacimiento: new Date('1988-03-25'),
        edad: 36,
        genero: 'Femenino',
        telefono: '8888-3456',
        email: 'maria.jimenez@clinicapca.com',
        direccion: 'Cartago, Centro',
        rol: 'Odontólogo',
        especialidad: 'Periodoncia',
        numeroLicencia: 'MED-44556',
        fechaContratacion: new Date('2022-02-01'),
        salario: 1550000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2022-02-01')
      },
      {
        id: 5,
        codigo: 'EMP-005',
        nombre: 'Laura',
        apellido1: 'Ramírez',
        apellido2: 'Castro',
        cedula: '5-5678-9012',
        fechaNacimiento: new Date('1995-07-14'),
        edad: 29,
        genero: 'Femenino',
        telefono: '8888-7890',
        email: 'laura.ramirez@clinicapca.com',
        direccion: 'San José, Desamparados',
        rol: 'Asistente',
        fechaContratacion: new Date('2023-04-01'),
        salario: 650000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2023-04-01')
      },
      {
        id: 6,
        codigo: 'EMP-006',
        nombre: 'Sofía',
        apellido1: 'Hernández',
        apellido2: 'López',
        cedula: '6-6789-0123',
        fechaNacimiento: new Date('1992-11-30'),
        edad: 32,
        genero: 'Femenino',
        telefono: '8888-2345',
        email: 'sofia.hernandez@clinicapca.com',
        direccion: 'Heredia, Santo Domingo',
        rol: 'Recepcionista',
        fechaContratacion: new Date('2021-09-01'),
        salario: 550000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        createdAt: new Date('2021-09-01')
      },
      {
        id: 7,
        codigo: 'EMP-007',
        nombre: 'Priscilla',
        apellido1: 'Cruz',
        apellido2: 'Angulo',
        cedula: '1-0987-6543',
        fechaNacimiento: new Date('1987-04-18'),
        edad: 37,
        genero: 'Femenino',
        telefono: '8888-6543',
        email: 'priscilla.cruz@clinicapca.com',
        direccion: 'San José, Centro',
        rol: 'Administrador',
        fechaContratacion: new Date('2018-01-01'),
        salario: 1200000,
        horarioTrabajo: this.getHorarioDefault(),
        activo: true,
        observaciones: 'Directora y fundadora de la clínica',
        createdAt: new Date('2018-01-01')
      }
    ];
  }
}