import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, PacienteFormData } from '../models/paciente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  // Obtener todos los pacientes
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  // Obtener paciente por ID
  getPacienteById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  // Buscar pacientes
  buscarPacientes(termino: string): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }

  // Crear paciente
  crearPaciente(data: PacienteFormData): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, data);
  }

  // Actualizar paciente
  actualizarPaciente(id: number, data: PacienteFormData): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar (desactivar) paciente
  eliminarPaciente(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  // Activar paciente
  activarPaciente(id: number): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/${id}/activar`, {});
  }
}
