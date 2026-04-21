import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { InventarioService } from '../../core/services/inventario.service';
import { Notificacion } from '../../core/models/notificacion.model';
import { ToastService } from '../../core/services/toast.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule, MatIconModule, MatButtonModule,
    MatBadgeModule, MatDividerModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notificacion[] = [];
  unreadCount = 0;
  loading = false;

  private subs = new Subscription();

  constructor(
    private notificacionesService: NotificacionesService,
    private inventarioService: InventarioService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado reactivo
    this.subs.add(
      this.notificacionesService.notifications$.subscribe(data => {
        this.notifications = data;
      })
    );
    this.subs.add(
      this.notificacionesService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Cargar inicial + auto-refresh cada 60 segundos
    this.subs.add(
      interval(60_000).pipe(
        startWith(0),
        switchMap(() => this.notificacionesService.cargarNotificaciones().pipe(
          catchError(() => of([]))
        ))
      ).subscribe()
    );

    // Verificar stock bajo y generar notificaciones locales
    this.verificarStockBajo();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Verificar stock bajo en inventario ────────────────────────────────
  private verificarStockBajo(): void {
    this.inventarioService.getProductosBajoStock().pipe(
      catchError(() => of([]))
    ).subscribe((productos: any[]) => {
      if (productos.length === 0) return;

      // Agregar notificaciones locales de stock bajo (no guardadas en BD)
      const stockNotifs: Notificacion[] = productos.map((p: any, i: number) => ({
        id: -(i + 1),  // ID negativo = local, no de BD
        tipo: 'inventario',
        titulo: `Stock bajo: ${p.nombre}`,
        mensaje: `Quedan ${p.stockActual} unidades (mínimo: ${p.stockMinimo})`,
        productoInventarioId: p.id,
        productoNombre: p.nombre,
        leida: false,
        fechaCreacion: new Date().toISOString()
      }));

      // Mezclar con las notificaciones reales
      const actuales = this.notificacionesService['notificationsSubject'].value;
      const sinStock = actuales.filter((n: Notificacion) => n.id > 0); // solo las reales
      const combinadas = [...stockNotifs, ...sinStock];
      this.notificacionesService['notificationsSubject'].next(combinadas);
      const noLeidas = combinadas.filter((n: Notificacion) => !n.leida).length;
      this.notificacionesService['unreadCountSubject'].next(noLeidas);
    });
  }

  // ── Acciones ──────────────────────────────────────────────────────────
  marcarLeida(item: Notificacion): void {
    if (item.leida) return;

    // Notificaciones locales (stock bajo) — solo marcar localmente
    if (item.id < 0) {
      const notifs = this.notificacionesService['notificationsSubject'].value;
      const idx = notifs.findIndex((n: Notificacion) => n.id === item.id);
      if (idx !== -1) {
        notifs[idx].leida = true;
        this.notificacionesService['notificationsSubject'].next([...notifs]);
        const noLeidas = notifs.filter((n: Notificacion) => !n.leida).length;
        this.notificacionesService['unreadCountSubject'].next(noLeidas);
      }
      return;
    }

    // Notificaciones reales → backend
    this.notificacionesService.marcarComoLeida(item.id).subscribe({
      error: () => {}  // silencioso
    });
  }

  marcarTodas(): void {
    this.notificacionesService.marcarTodasComoLeidas().subscribe({
      next: () => this.toast.success('Todas las notificaciones leídas'),
      error: () => {
        // Fallback: marcar localmente si backend falla
        const notifs = this.notificacionesService['notificationsSubject'].value
          .map((n: Notificacion) => ({ ...n, leida: true }));
        this.notificacionesService['notificationsSubject'].next(notifs);
        this.notificacionesService['unreadCountSubject'].next(0);
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  getIcon(tipo?: string | null): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('inventario') || t.includes('stock')) return 'inventory_2';
    if (t.includes('cita'))    return 'event';
    if (t.includes('usuario')) return 'person';
    if (t.includes('pago'))    return 'payments';
    return 'notifications';
  }

  getItemClass(item: Notificacion): string {
    const tipo = (item.tipo || '').toLowerCase();
    if (tipo.includes('inventario') || tipo.includes('stock')) return 'notif-stock';
    if (tipo.includes('cita'))    return 'notif-cita';
    if (tipo.includes('pago'))    return 'notif-pago';
    return '';
  }

  getTiempoRelativo(fecha: string): string {
    if (!fecha) return '';
    const diff = Date.now() - new Date(fecha).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return 'Hace unos segundos';
    if (m < 60) return `Hace ${m} min`;
    if (h < 24) return `Hace ${h} h`;
    return `Hace ${d} día(s)`;
  }
}