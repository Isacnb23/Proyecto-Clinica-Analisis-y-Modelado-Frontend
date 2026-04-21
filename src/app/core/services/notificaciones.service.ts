import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = `${environment.apiUrl}/Notificaciones`;

  // ✅ Observables que esperan los componentes
  private notificationsSubject = new BehaviorSubject<Notificacion[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar notificaciones al iniciar
    this.cargarNotificaciones().subscribe();
  }

  // ✅ Método para cargar notificaciones
  cargarNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl).pipe(
      tap(notificaciones => {
        this.notificationsSubject.next(notificaciones);
        const noLeidas = notificaciones.filter(n => !n.leida).length;
        this.unreadCountSubject.next(noLeidas);
      })
    );
  }

  // Obtener notificaciones del usuario actual
  getNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl).pipe(
      tap(notificaciones => {
        this.notificationsSubject.next(notificaciones);
        const noLeidas = notificaciones.filter(n => !n.leida).length;
        this.unreadCountSubject.next(noLeidas);
      })
    );
  }

  // Obtener notificaciones no leídas
  getNoLeidas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`);
  }

  // Marcar como leída
  marcarComoLeida(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/leer`, {}).pipe(
      tap(() => {
        // Actualizar el estado local
        const notificaciones = this.notificationsSubject.value;
        const index = notificaciones.findIndex(n => n.id === id);
        if (index !== -1) {
          notificaciones[index].leida = true;
          this.notificationsSubject.next([...notificaciones]);
          this.unreadCountSubject.next(notificaciones.filter(n => !n.leida).length);
        }
      })
    );
  }

  // Marcar todas como leídas
  marcarTodasComoLeidas(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/leer-todas`, {}).pipe(
      tap(() => {
        // Actualizar el estado local
        const notificaciones = this.notificationsSubject.value.map(n => ({
          ...n,
          leida: true
        }));
        this.notificationsSubject.next(notificaciones);
        this.unreadCountSubject.next(0);
      })
    );
  }

  // Eliminar notificación
  eliminarNotificacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Actualizar el estado local
        const notificaciones = this.notificationsSubject.value.filter(n => n.id !== id);
        this.notificationsSubject.next(notificaciones);
        this.unreadCountSubject.next(notificaciones.filter(n => !n.leida).length);
      })
    );
  }

  // Crear notificación (admin)
  crearNotificacion(data: any): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.apiUrl, data).pipe(
      tap(notificacion => {
        // Agregar al estado local
        const notificaciones = [notificacion, ...this.notificationsSubject.value];
        this.notificationsSubject.next(notificaciones);
        if (!notificacion.leida) {
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
      })
    );
  }
}