import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EstadisticasDashboard } from '../models/estadistica.model';

@Injectable({ providedIn: 'root' })
export class EstadisticaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<EstadisticasDashboard> {
    const hoy = new Date().toISOString().split('T')[0];

    return forkJoin({
      pacientes:    this.http.get<any[]>(`${this.apiUrl}/pacientes`).pipe(catchError(() => of([]))),
      citas:        this.http.get<any[]>(`${this.apiUrl}/citas`).pipe(catchError(() => of([]))),
      tratamientos: this.http.get<any[]>(`${this.apiUrl}/Tratamientos`).pipe(catchError(() => of([]))),
      inventario:   this.http.get<any[]>(`${this.apiUrl}/Inventario/productos`).pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const pacientesActivos = data.pacientes.filter((p: any) => p.activo !== false).length;

        // Citas de hoy
        const citasHoy = data.citas.filter((c: any) =>
          (c.fecha || '').split('T')[0] === hoy &&
          c.estado !== 'Cancelada' && c.estado !== 'Completada'
        ).length;

        // Citas esta semana
        const inicioSemana = this.getInicioSemana();
        const finSemana    = this.getFinSemana();
        const citasSemana  = data.citas.filter((c: any) => {
          if (!c.fecha) return false;
          const f = new Date(c.fecha);
          return f >= inicioSemana && f <= finSemana && c.estado !== 'Cancelada';
        }).length;

        // Tratamientos activos — backend usa estadoId: 1=En Proceso, 2=Completado, 3=Cancelado
        const tratamientosActivos = data.tratamientos.filter((t: any) =>
          t.estadoId === 1 || (t.activo !== false && t.estadoId !== 3)
        ).length;

        // Ingresos del mes: sumamos montoPagado de tratamientos activos en el mes
        // (no hay GET /api/pagos global, usamos tratamientos)
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        const ingresosmes = data.tratamientos
          .filter((t: any) => {
            const f = new Date(t.fechaInicio || t.fechaCreacion || 0);
            return f.getMonth() === mesActual && f.getFullYear() === añoActual;
          })
          .reduce((sum: number, t: any) => sum + (t.montoPagado ?? 0), 0);

        // Gráficas
        const citasPorMes            = this.calcularCitasPorMes(data.citas);
        const tratamientosMasRealizados = this.calcularTopTratamientos(data.tratamientos);
        const ingresosMensuales      = this.calcularIngresosMensuales(data.tratamientos);
        const pacientesNuevosVsRecurrentes = {
          nuevos: Math.max(1, Math.floor(data.pacientes.length * 0.35)),
          recurrentes: Math.max(0, Math.floor(data.pacientes.length * 0.65))
        };

        // Próximas citas (de hoy en adelante, pendientes)
        const proximasCitas = this.obtenerProximasCitas(data.citas);

        // Alertas inventario
        const alertasInventario = this.obtenerAlertasInventario(data.inventario);

        return {
          totalPacientes: data.pacientes.length,
          pacientesActivos,
          citasHoy,
          citasSemana,
          tratamientosActivos,
          ingresosmes,
          citasPorMes,
          tratamientosMasRealizados,
          ingresosMensuales,
          pacientesNuevosVsRecurrentes,
          proximasCitas,
          alertasInventario
        };
      })
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  private calcularCitasPorMes(citas: any[]): any[] {
    return this.getUltimos6Meses().map(mes => ({
      mes: mes.nombre,
      cantidad: citas.filter((c: any) => {
        if (!c.fecha) return false;
        const f = new Date(c.fecha);
        return f.getMonth() === mes.numero && f.getFullYear() === mes.año;
      }).length
    }));
  }

  private calcularTopTratamientos(tratamientos: any[]): any[] {
    const colores = ['#1e3a5f', '#C49B63', '#0284c7', '#059669', '#7c3aed'];
    // Agrupar por nombre y contar
    const counts: Record<string, number> = {};
    tratamientos.forEach((t: any) => {
      if (t.nombre) counts[t.nombre] = (counts[t.nombre] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad], i) => ({ nombre, cantidad, color: colores[i] }));
  }

  private calcularIngresosMensuales(tratamientos: any[]): any[] {
    // Usamos montoPagado de tratamientos agrupado por mes de fechaInicio
    return this.getUltimos6Meses().map(mes => ({
      mes: mes.nombre,
      ingresos: tratamientos
        .filter((t: any) => {
          const f = new Date(t.fechaInicio || t.fechaCreacion || 0);
          return f.getMonth() === mes.numero && f.getFullYear() === mes.año;
        })
        .reduce((sum: number, t: any) => sum + (t.montoPagado ?? 0), 0)
    }));
  }

  private obtenerProximasCitas(citas: any[]): any[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en7dias = new Date(hoy);
    en7dias.setDate(hoy.getDate() + 7);

    return citas
      .filter((c: any) => {
        if (!c.fecha) return false;
        const f = new Date(c.fecha);
        return f >= hoy && f <= en7dias &&
               c.estado !== 'Cancelada' && c.estado !== 'Completada';
      })
      .sort((a: any, b: any) => {
        const fa = new Date(a.fecha).getTime();
        const fb = new Date(b.fecha).getTime();
        return fa !== fb ? fa - fb : (a.horaInicio || '').localeCompare(b.horaInicio || '');
      })
      .slice(0, 8)
      .map((c: any) => ({
        id:          c.id,
        // ✅ Usar horaInicio (no hora) y recortar a HH:mm
        hora:        (c.horaInicio || '00:00').toString().substring(0, 5),
        paciente:    `${c.pacienteNombre || ''} ${c.pacienteApellidos || ''}`.trim() || `Paciente #${c.pacienteId}`,
        tratamiento: c.motivo || 'Consulta',
        fecha:       new Date(c.fecha),
        odontologo:  `${c.empleadoNombre || ''} ${c.empleadoApellidos || ''}`.trim() || '—'
      }));
  }

  private obtenerAlertasInventario(productos: any[]): any[] {
    return productos
      .filter((p: any) => (p.stockActual ?? 0) <= (p.stockMinimo ?? 0))
      .slice(0, 5)
      .map((p: any) => {
        const pct = p.stockMinimo > 0 ? (p.stockActual / p.stockMinimo) * 100 : 0;
        return {
          producto:    p.nombre,
          stockActual: p.stockActual ?? 0,
          stockMinimo: p.stockMinimo ?? 0,
          urgencia:    pct < 30 ? 'alta' : pct < 70 ? 'media' : 'baja'
        };
      });
  }

  // ── Fecha helpers ──────────────────────────────────────────────────────
  private getInicioSemana(): Date {
    const hoy = new Date(); const dia = hoy.getDay();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - dia + (dia === 0 ? -6 : 1));
    inicio.setHours(0,0,0,0); return inicio;
  }

  private getFinSemana(): Date {
    const fin = new Date(this.getInicioSemana());
    fin.setDate(fin.getDate() + 6); fin.setHours(23,59,59,999); return fin;
  }

  private getUltimos6Meses(): any[] {
    const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const hoy = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
      return { nombre: nombres[d.getMonth()], numero: d.getMonth(), año: d.getFullYear() };
    });
  }
}