import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TratamientoFactura {
  id: number;
  nombre: string;
  pacienteId: number;
  pacienteNombre?: string;
  empleadoId: number;
  empleadoNombre?: string;
  costoTotal: number;
  montoPagado: number;
  saldo: number;
  estadoId: number;
  fechaInicio: string;
}

export interface PagoCreate {
  tratamientoId: number;
  monto: number;
  metodoPagoId: number;
  numeroReferencia?: string;
  notas?: string;
  fechaPago?: string;
}

export interface PagoResponse {
  id: number;
  tratamientoId: number;
  monto: number;
  metodoPagoId: number;
  numeroReferencia?: string;
  notas?: string;
  fechaPago: string;
}

export const METODOS_PAGO = [
  { id: 1, nombre: 'Efectivo' },
  { id: 2, nombre: 'Tarjeta de Débito' },
  { id: 3, nombre: 'Tarjeta de Crédito' },
  { id: 4, nombre: 'SINPE Móvil' },
  { id: 5, nombre: 'Transferencia Bancaria' },
  { id: 6, nombre: 'Cheque' },
];

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private tratUrl = `${environment.apiUrl}/Tratamientos`;
  private pagoUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  getTratamientosFacturacion(): Observable<TratamientoFactura[]> {
    return this.http.get<TratamientoFactura[]>(this.tratUrl).pipe(
      catchError(() => of([]))
    );
  }

  getPagosPorTratamiento(tratamientoId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.pagoUrl}/tratamiento/${tratamientoId}`).pipe(
      catchError(() => of([]))
    );
  }

  registrarPago(data: PagoCreate): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.pagoUrl, data);
  }
}