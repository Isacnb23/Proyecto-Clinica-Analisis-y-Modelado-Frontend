import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Cita, CitaFormData, Odontologo, Tratamiento, HorarioDisponible } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private citasSubject = new BehaviorSubject<Cita[]>(this.getCitasMock());
  public citas$ = this.citasSubject.asObservable();

  constructor() {}

  // Obtener todas las citas
  getCitas(): Observable<Cita[]> {
    return this.citas$.pipe(delay(500));
  }

  // Obtener cita por ID
  getCitaById(id: number): Observable<Cita | undefined> {
    return this.citas$.pipe(
      map(citas => citas.find(c => c.id === id))
    );
  }

  // Obtener citas por fecha
  getCitasByFecha(fecha: Date): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => {
        const citaFecha = new Date(c.fecha);
        return citaFecha.toDateString() === fecha.toDateString();
      }))
    );
  }

  // Obtener citas por paciente
  getCitasByPaciente(pacienteId: number): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => c.pacienteId === pacienteId))
    );
  }

  // Crear cita
  crearCita(data: CitaFormData): Observable<Cita> {
    const citas = this.citasSubject.value;
    const nuevoId = Math.max(...citas.map(c => c.id), 0) + 1;

    // Buscar datos del paciente (simulado)
    const paciente = this.getPacienteNombre(data.pacienteId);
    const odontologo = this.getOdontologoNombre(data.odontologoId);
    const tratamiento = this.getTratamientoNombre(data.tratamientoId);

    const nuevaCita: Cita = {
      id: nuevoId,
      pacienteId: data.pacienteId,
      pacienteNombre: paciente,
      odontologoId: data.odontologoId,
      odontologoNombre: odontologo,
      tratamientoId: data.tratamientoId,
      tratamientoNombre: tratamiento,
      fecha: data.fecha,
      hora: data.hora,
      duracion: data.duracion,
      estado: 'pendiente',
      motivo: data.motivo,
      observaciones: data.observaciones,
      createdAt: new Date()
    };

    const nuevaLista = [...citas, nuevaCita];
    this.citasSubject.next(nuevaLista);

    return of(nuevaCita).pipe(delay(500));
  }

  // Actualizar cita
  actualizarCita(id: number, data: Partial<Cita>): Observable<Cita> {
    const citas = this.citasSubject.value;
    const index = citas.findIndex(c => c.id === id);

    if (index !== -1) {
      const citaActualizada: Cita = {
        ...citas[index],
        ...data,
        updatedAt: new Date()
      };

      const nuevaLista = [...citas];
      nuevaLista[index] = citaActualizada;
      this.citasSubject.next(nuevaLista);

      return of(citaActualizada).pipe(delay(500));
    }

    throw new Error('Cita no encontrada');
  }

  // Cambiar estado de cita
  cambiarEstado(id: number, estado: Cita['estado']): Observable<boolean> {
    return this.actualizarCita(id, { estado }).pipe(map(() => true));
  }

  // Cancelar cita
  cancelarCita(id: number): Observable<boolean> {
    return this.cambiarEstado(id, 'cancelada');
  }

  // Confirmar cita
  confirmarCita(id: number): Observable<boolean> {
    return this.cambiarEstado(id, 'confirmada');
  }

  // Completar cita
  completarCita(id: number): Observable<boolean> {
    return this.cambiarEstado(id, 'completada');
  }

  // Obtener odontólogos
  getOdontologos(): Observable<Odontologo[]> {
    return of([
      { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Odontología General', activo: true },
      { id: 2, nombre: 'Dra. Ana Mora', especialidad: 'Ortodoncia', activo: true },
      { id: 3, nombre: 'Dr. Carlos Solís', especialidad: 'Endodoncia', activo: true },
      { id: 4, nombre: 'Dra. María Jiménez', especialidad: 'Periodoncia', activo: true }
    ]).pipe(delay(300));
  }

  // Obtener tratamientos
  getTratamientos(): Observable<Tratamiento[]> {
    return of([
      { id: 1, nombre: 'Limpieza Dental', descripcion: 'Profilaxis dental completa', duracionEstimada: 30, costo: 25000, activo: true },
      { id: 2, nombre: 'Blanqueamiento', descripcion: 'Blanqueamiento dental profesional', duracionEstimada: 60, costo: 120000, activo: true },
      { id: 3, nombre: 'Ortodoncia - Consulta', descripcion: 'Primera consulta de ortodoncia', duracionEstimada: 45, costo: 15000, activo: true },
      { id: 4, nombre: 'Ortodoncia - Control', descripcion: 'Control mensual de ortodoncia', duracionEstimada: 30, costo: 35000, activo: true },
      { id: 5, nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', duracionEstimada: 90, costo: 180000, activo: true },
      { id: 6, nombre: 'Extracción Simple', descripcion: 'Extracción de pieza dental', duracionEstimada: 30, costo: 35000, activo: true },
      { id: 7, nombre: 'Corona Dental', descripcion: 'Colocación de corona', duracionEstimada: 60, costo: 250000, activo: true },
      { id: 8, nombre: 'Implante Dental', descripcion: 'Colocación de implante', duracionEstimada: 120, costo: 800000, activo: true }
    ]).pipe(delay(300));
  }

  // Obtener horarios disponibles
  getHorariosDisponibles(fecha: Date, odontologoId: number): Observable<string[]> {
    // Horarios base (8:00 AM a 6:00 PM)
    const horariosBase = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30'
    ];

    // Filtrar horarios ya ocupados (simulado)
    return this.getCitasByFecha(fecha).pipe(
      map(citas => {
        const citasOdontologo = citas.filter(c => c.odontologoId === odontologoId);
        const horariosOcupados = citasOdontologo.map(c => c.hora);
        return horariosBase.filter(h => !horariosOcupados.includes(h));
      }),
      delay(300)
    );
  }

  // Helpers
  private getPacienteNombre(id: number): string {
    const nombres = ['María González', 'Carlos Rodríguez', 'Ana Martínez', 'Roberto Fernández', 'Sofía Vargas'];
    return nombres[id - 1] || `Paciente ${id}`;
  }

  private getOdontologoNombre(id: number): string {
    const nombres = ['Dr. Juan Pérez', 'Dra. Ana Mora', 'Dr. Carlos Solís', 'Dra. María Jiménez'];
    return nombres[id - 1] || `Odontólogo ${id}`;
  }

  private getTratamientoNombre(id: number): string {
    const nombres = ['Limpieza Dental', 'Blanqueamiento', 'Ortodoncia - Consulta', 'Ortodoncia - Control', 'Endodoncia', 'Extracción Simple', 'Corona Dental', 'Implante Dental'];
    return nombres[id - 1] || `Tratamiento ${id}`;
  }

  // Datos mock
  private getCitasMock(): Cita[] {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const pasadoManana = new Date(hoy);
    pasadoManana.setDate(pasadoManana.getDate() + 2);

    return [
      {
        id: 1,
        pacienteId: 1,
        pacienteNombre: 'María González',
        odontologoId: 1,
        odontologoNombre: 'Dr. Juan Pérez',
        tratamientoId: 1,
        tratamientoNombre: 'Limpieza Dental',
        fecha: hoy,
        hora: '09:00',
        duracion: 30,
        estado: 'confirmada',
        motivo: 'Limpieza semestral',
        costo: 25000,
        createdAt: new Date('2024-12-01')
      },
      {
        id: 2,
        pacienteId: 2,
        pacienteNombre: 'Carlos Rodríguez',
        odontologoId: 2,
        odontologoNombre: 'Dra. Ana Mora',
        tratamientoId: 4,
        tratamientoNombre: 'Ortodoncia - Control',
        fecha: hoy,
        hora: '10:30',
        duracion: 30,
        estado: 'confirmada',
        motivo: 'Control mensual',
        costo: 35000,
        createdAt: new Date('2024-12-02')
      },
      {
        id: 3,
        pacienteId: 5,
        pacienteNombre: 'Sofía Vargas',
        odontologoId: 1,
        odontologoNombre: 'Dr. Juan Pérez',
        tratamientoId: 5,
        tratamientoNombre: 'Endodoncia',
        fecha: hoy,
        hora: '02:00',
        duracion: 90,
        estado: 'pendiente',
        motivo: 'Tratamiento de conducto molar',
        costo: 180000,
        createdAt: new Date('2024-12-03')
      },
      {
        id: 4,
        pacienteId: 4,
        pacienteNombre: 'Roberto Fernández',
        odontologoId: 2,
        odontologoNombre: 'Dra. Ana Mora',
        tratamientoId: 2,
        tratamientoNombre: 'Blanqueamiento',
        fecha: hoy,
        hora: '03:30',
        duracion: 60,
        estado: 'pendiente',
        motivo: 'Blanqueamiento dental',
        costo: 120000,
        createdAt: new Date('2024-12-04')
      },
      {
        id: 5,
        pacienteId: 1,
        pacienteNombre: 'María González',
        odontologoId: 3,
        odontologoNombre: 'Dr. Carlos Solís',
        tratamientoId: 6,
        tratamientoNombre: 'Extracción Simple',
        fecha: manana,
        hora: '09:00',
        duracion: 30,
        estado: 'confirmada',
        costo: 35000,
        createdAt: new Date('2024-12-05')
      },
      {
        id: 6,
        pacienteId: 3,
        pacienteNombre: 'Ana Martínez',
        odontologoId: 1,
        odontologoNombre: 'Dr. Juan Pérez',
        tratamientoId: 1,
        tratamientoNombre: 'Limpieza Dental',
        fecha: manana,
        hora: '11:00',
        duracion: 30,
        estado: 'pendiente',
        costo: 25000,
        createdAt: new Date('2024-12-06')
      },
      {
        id: 7,
        pacienteId: 2,
        pacienteNombre: 'Carlos Rodríguez',
        odontologoId: 4,
        odontologoNombre: 'Dra. María Jiménez',
        tratamientoId: 7,
        tratamientoNombre: 'Corona Dental',
        fecha: pasadoManana,
        hora: '10:00',
        duracion: 60,
        estado: 'confirmada',
        costo: 250000,
        createdAt: new Date('2024-12-07')
      }
    ];
  }
}