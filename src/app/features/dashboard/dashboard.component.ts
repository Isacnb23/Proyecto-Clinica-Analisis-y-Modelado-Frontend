import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { EstadisticasDashboard, CitaProxima } from '../../core/models/estadistica.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatTableModule, MatChipsModule, MatProgressBarModule, MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  estadisticas?: EstadisticasDashboard;
  loading = true;

  displayedColumns = ['hora', 'paciente', 'tratamiento', 'odontologo'];
  dataSource = new MatTableDataSource<CitaProxima>([]);

  mesActual = new Date().toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });

  constructor(
    private estadisticaService: EstadisticaService,
    public router: Router
  ) {}

  ngOnInit(): void { this.cargarEstadisticas(); }

  cargarEstadisticas(): void {
    this.estadisticaService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.dataSource.data = data.proximasCitas;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Gráfica de barras CSS ──────────────────────────────────────────────
  get maxCitas(): number {
    const vals = this.estadisticas?.citasPorMes.map(c => c.cantidad) || [0];
    return Math.max(...vals, 1);
  }

  getBarHeight(cantidad: number): number {
    return Math.round((cantidad / this.maxCitas) * 100);
  }

  get maxIngresos(): number {
    const vals = this.estadisticas?.ingresosMensuales.map(i => i.ingresos) || [0];
    return Math.max(...vals, 1);
  }

  getIngresosHeight(ingresos: number): number {
    return Math.round((ingresos / this.maxIngresos) * 100);
  }

  get totalTratamientosStat(): number {
    return this.estadisticas?.tratamientosMasRealizados.reduce((s, t) => s + t.cantidad, 0) || 1;
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  formatCurrency(v: number): string {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v);
  }

  getUrgenciaClass(u: string): string { return `urgencia-${u}`; }

  irACitas():      void { this.router.navigate(['/citas']); }
  irAInventario(): void { this.router.navigate(['/inventario']); }
}