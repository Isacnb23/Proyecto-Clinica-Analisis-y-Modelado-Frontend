import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaz principal de Cita (debe coincidir con el backend)
export interface Cita {
  id?: number;
  pacienteId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  observaciones?: string;
  estado?: string;
  pacienteNombre?: string;
  pacienteApellidos?: string;
  pacienteCedula?: string;
  empleadoNombre?: string;
  empleadoApellidos?: string;
  empleadoEspecialidad?: string;
}

// Interfaces auxiliares (para el formulario)
export interface Odontologo {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

export interface Tratamiento {
  id: number;
  nombre: string;
  descripcion: string;
  duracionEstimada: number;
  costo: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  // ==================== ENDPOINTS REALES ====================
  
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  getCitasByFecha(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/fecha?fecha=${fecha}`);
  }

  getCitasByPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  getCitasByEmpleado(empleadoId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/empleado/${empleadoId}`);
  }

  crearCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  actualizarCita(id: number, cita: Cita): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cita);
  }

  confirmarCita(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/confirmar`, {});
  }

  cancelarCita(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancelar`, {});
  }

  completarCita(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/completar`, {});
  }

  // ==================== MÉTODOS AUXILIARES (MOCK TEMPORAL) ====================
  // TODO: Reemplazar con endpoints reales cuando estén disponibles
  
  getOdontologos(): Observable<Odontologo[]> {
    // TEMPORAL: Datos mock hasta que el backend tenga endpoint /empleados
    return of([
      { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Odontología General', activo: true },
      { id: 2, nombre: 'Dra. Ana Mora', especialidad: 'Ortodoncia', activo: true },
      { id: 3, nombre: 'Dr. Carlos Solís', especialidad: 'Endodoncia', activo: true },
      { id: 4, nombre: 'Dra. María Jiménez', especialidad: 'Periodoncia', activo: true }
    ]).pipe(delay(300));
  }

  getTratamientos(): Observable<Tratamiento[]> {
    // TEMPORAL: Datos mock hasta que el backend tenga endpoint /tratamientos
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

  getHorariosDisponibles(fecha: Date, empleadoId: number): Observable<string[]> {
    // TEMPORAL: Horarios mock hasta que el backend tenga endpoint /horarios
    const horariosBase = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30'
    ];
    
    // Por ahora devuelve todos los horarios
    // TODO: Consultar disponibilidad real con el backend
    return of(horariosBase).pipe(delay(300));
  }
}