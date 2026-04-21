import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

export interface Odontologo {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

// Tipos de atención para citas (solo para UX/duración, no se envían al backend)
export interface TipoCita {
  id: number;
  nombre: string;
  descripcion: string;
  duracionEstimada: number;
  costo: number;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;
  private empleadosUrl = `${environment.apiUrl}/Empleados`;

  constructor(private http: HttpClient) {}

  // ──────────────── CITAS ────────────────────────────────────────
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
    return this.http.patch(`${this.apiUrl}/${id}/cancelar`, { motivo: 'Cancelada por el sistema' });
  }

  completarCita(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/completar`, {});
  }

  // ──────────────── ODONTÓLOGOS (API REAL) ───────────────────────
  // ✅ Usa el endpoint real de empleados
  getOdontologos(): Observable<Odontologo[]> {
    return this.http.get<any[]>(this.empleadosUrl).pipe(
      map(empleados =>
        empleados
          .filter((e: any) => e.activo !== false)
          .map((e: any) => ({
            id: e.id,
            nombre: `${e.nombre || ''} ${e.apellidos || ''}`.trim(),
            especialidad: e.especialidad || e.rol || 'Sin especialidad',
            activo: e.activo ?? true
          }))
      ),
      catchError(() => of([]))
    );
  }

  // ──────────────── TIPOS DE CITA (para duración UX) ─────────────
  // No se envían al backend — son solo para que el form calcule la duración
  getTratamientos(): Observable<TipoCita[]> {
    return of([
      { id: 1,  nombre: 'Consulta General',      descripcion: 'Revisión general', duracionEstimada: 30,  costo: 15000,  activo: true },
      { id: 2,  nombre: 'Limpieza Dental',        descripcion: 'Profilaxis dental', duracionEstimada: 45,  costo: 25000,  activo: true },
      { id: 3,  nombre: 'Blanqueamiento',          descripcion: 'Blanqueamiento profesional', duracionEstimada: 60,  costo: 120000, activo: true },
      { id: 4,  nombre: 'Ortodoncia - Consulta',  descripcion: 'Primera consulta', duracionEstimada: 45,  costo: 15000,  activo: true },
      { id: 5,  nombre: 'Ortodoncia - Control',   descripcion: 'Control mensual', duracionEstimada: 30,  costo: 35000,  activo: true },
      { id: 6,  nombre: 'Endodoncia',              descripcion: 'Tratamiento de conducto', duracionEstimada: 90,  costo: 180000, activo: true },
      { id: 7,  nombre: 'Extracción Simple',       descripcion: 'Extracción de pieza', duracionEstimada: 30,  costo: 35000,  activo: true },
      { id: 8,  nombre: 'Extracción Compleja',     descripcion: 'Extracción quirúrgica', duracionEstimada: 60,  costo: 80000,  activo: true },
      { id: 9,  nombre: 'Corona Dental',           descripcion: 'Colocación de corona', duracionEstimada: 60,  costo: 250000, activo: true },
      { id: 10, nombre: 'Implante Dental',         descripcion: 'Colocación de implante', duracionEstimada: 120, costo: 800000, activo: true },
      { id: 11, nombre: 'Resina Compuesta',        descripcion: 'Restauración con resina', duracionEstimada: 45,  costo: 40000,  activo: true },
      { id: 12, nombre: 'Urgencia Dental',         descripcion: 'Atención de urgencia', duracionEstimada: 30,  costo: 20000,  activo: true },
    ]);
  }

  // Horarios disponibles (slots fijos — pendiente integración con horarios reales)
  getHorariosDisponibles(_fecha: any, _empleadoId: number): Observable<string[]> {
    return of([
      '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
      '11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30',
      '16:00','16:30','17:00'
    ]);
  }
}