import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tratamiento, CategoriaTratamiento } from '../models/tratamiento.model';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {
  private apiUrl = `${environment.apiUrl}/tratamientos`;

  constructor(private http: HttpClient) {}

  // ===== TRATAMIENTOS =====
  getTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(this.apiUrl);
  }

  getTratamientoById(id: number): Observable<Tratamiento> {
    return this.http.get<Tratamiento>(`${this.apiUrl}/${id}`);
  }

  buscarTratamientos(termino: string): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.apiUrl}/buscar?nombre=${termino}`);
  }

  crearTratamiento(data: any): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(this.apiUrl, data);
  }

  // ✅ ACTUALIZAR con 2 parámetros (id, formData)
  actualizarTratamiento(id: number, data: any): Observable<Tratamiento> {
    // Asegurar que el ID esté en el body
    const payload = { ...data, id };
    return this.http.put<Tratamiento>(this.apiUrl, payload);
  }

  eliminarTratamiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activarTratamiento(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {});
  }

  // ===== CATEGORÍAS =====
  getCategorias(): Observable<CategoriaTratamiento[]> {
    return this.http.get<CategoriaTratamiento[]>(`${this.apiUrl}/categorias`);
  }

  getTratamientosByCategoria(categoriaId: number): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }
}