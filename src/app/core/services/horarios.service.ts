import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BloqueDisponibilidad {
  id: number;
  diaSemana: number;   // 0=Lunes … 6=Domingo
  horaInicio: string;  // "HH:mm:ss"
  horaFin: string;
  activo: boolean;
}

export interface ExcepcionHorario {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private apiUrl = `${environment.apiUrl}/Horarios`;

  constructor(private http: HttpClient) {}

  // ── Bloques de disponibilidad ──────────────────────────────────
  getBloques(empleadoId: number): Observable<BloqueDisponibilidad[]> {
    return this.http.get<BloqueDisponibilidad[]>(`${this.apiUrl}/${empleadoId}/disponibilidad`);
  }

  crearBloque(empleadoId: number, diaSemana: number, horaInicio: string, horaFin: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${empleadoId}/disponibilidad/bloques`, {
      diaSemana,
      horaInicio,
      horaFin
    });
  }

  eliminarBloque(bloqueId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/disponibilidad/bloques/${bloqueId}`);
  }

  // ── Excepciones ────────────────────────────────────────────────
  getExcepciones(empleadoId: number): Observable<ExcepcionHorario[]> {
    return this.http.get<ExcepcionHorario[]>(`${this.apiUrl}/${empleadoId}/excepciones`);
  }

  crearExcepcion(empleadoId: number, dto: { fechaInicio: string; fechaFin: string; tipo: string; motivo?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${empleadoId}/excepciones`, dto);
  }

  eliminarExcepcion(excepcionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/excepciones/${excepcionId}`);
  }
}
