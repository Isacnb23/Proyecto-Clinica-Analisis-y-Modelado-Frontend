import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { Notificacion } from '../../core/models/notificacion.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  notifications: Notificacion[] = [];
  unreadCount = 0;
  loading = false;

  constructor(
    private notificacionesService: NotificacionesService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargar();

    this.notificacionesService.notifications$.subscribe(data => {
      this.notifications = data;
    });

    this.notificacionesService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  cargar(): void {
    this.loading = true;

    this.notificacionesService.cargarNotificaciones().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toast.httpError(error, 'No fue posible cargar las notificaciones');
      }
    });
  }

  marcarLeida(item: Notificacion): void {
    if (item.leida) return;

    this.notificacionesService.marcarComoLeida(item.id).subscribe({
      next: () => {
        this.toast.success('Notificación marcada como leída');
      },
      error: (error) => {
        this.toast.httpError(error, 'No se pudo marcar la notificación');
      }
    });
  }

  marcarTodas(): void {
    this.notificacionesService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.toast.success('Todas las notificaciones fueron marcadas como leídas');
      },
      error: (error) => {
        this.toast.httpError(error, 'No se pudieron actualizar las notificaciones');
      }
    });
  }

  getIcon(tipo?: string | null): string {
    const value = (tipo || '').toLowerCase();

    if (value.includes('inventario')) return 'inventory_2';
    if (value.includes('cita')) return 'event';
    if (value.includes('usuario')) return 'person';
    return 'notifications';
  }

  getTiempoRelativo(fecha: string): string {
    const now = new Date().getTime();
    const created = new Date(fecha).getTime();
    const diffMs = now - created;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} día(s)`;
  }
}