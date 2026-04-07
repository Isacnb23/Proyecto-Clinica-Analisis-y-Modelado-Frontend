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
    return this.http.get<Paciente[]>(`${this.apiUrl}/buscar?nombre=${termino}`);
  }

  // Crear paciente
  crearPaciente(data: PacienteFormData): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, data);
  }

  // ✅ ACTUALIZAR (CORREGIDO PARA TU BACKEND)
  actualizarPaciente(data: any): Observable<Paciente> {
    return this.http.put<Paciente>(this.apiUrl, data);
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
