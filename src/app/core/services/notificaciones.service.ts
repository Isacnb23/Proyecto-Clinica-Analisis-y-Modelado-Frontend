import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = `${environment.apiUrl}/Notificaciones`;

  private notificationsSubject = new BehaviorSubject<Notificacion[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  unreadCount$ = this.notifications$.pipe(
    map(list => list.filter(item => !item.leida).length)
  );

  constructor(private http: HttpClient) {}

  cargarNotificaciones(leida?: boolean, tipo?: string): Observable<Notificacion[]> {
    const params = new URLSearchParams();

    if (leida !== undefined) {
      params.append('leida', String(leida));
    }

    if (tipo) {
      params.append('tipo', tipo);
    }

    const url = params.toString() ? `${this.apiUrl}?${params.toString()}` : this.apiUrl;

    return this.http.get<Notificacion[]>(url).pipe(
      tap(list => this.notificationsSubject.next(list))
    );
  }

  marcarComoLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/leer`, {}).pipe(
      switchMap(() => this.cargarNotificaciones()),
      map(() => void 0)
    );
  }

  marcarTodasComoLeidas(): Observable<void> {
    const pendientes = this.notificationsSubject.value.filter(n => !n.leida);

    if (!pendientes.length) {
      return of(void 0);
    }

    return forkJoin(
      pendientes.map(item => this.http.patch<void>(`${this.apiUrl}/${item.id}/leer`, {}))
    ).pipe(
      switchMap(() => this.cargarNotificaciones()),
      map(() => void 0)
    );
  }
}