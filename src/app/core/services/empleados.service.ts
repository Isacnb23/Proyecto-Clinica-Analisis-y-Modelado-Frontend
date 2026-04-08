import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmpleadoApi,
  EmpleadoCreateDto,
  EmpleadoUpdateDto
} from '../models/empleado-api.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  private apiUrl = `${environment.apiUrl}/Empleados`;

  constructor(private http: HttpClient) {}

  getEmpleados(activo?: boolean): Observable<EmpleadoApi[]> {
    if (activo === undefined) {
      return this.http.get<EmpleadoApi[]>(this.apiUrl);
    }

    return this.http.get<EmpleadoApi[]>(`${this.apiUrl}?activo=${activo}`);
  }

  getEmpleadoById(id: number): Observable<EmpleadoApi> {
    return this.http.get<EmpleadoApi>(`${this.apiUrl}/${id}`);
  }

  crearEmpleado(payload: EmpleadoCreateDto): Observable<EmpleadoApi> {
    return this.http.post<EmpleadoApi>(this.apiUrl, payload);
  }

  actualizarEmpleado(id: number, payload: EmpleadoUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  activarEmpleado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {});
  }

  desactivarEmpleado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {});
  }
}