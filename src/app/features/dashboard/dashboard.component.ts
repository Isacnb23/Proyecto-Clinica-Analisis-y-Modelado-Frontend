import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { EstadisticasDashboard, CitaProxima } from '../../core/models/estadistica.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  estadisticas?: EstadisticasDashboard;
  loading = true;

  // Tabla de próximas citas
  displayedColumns: string[] = ['hora', 'paciente', 'tratamiento', 'odontologo'];
  dataSource = new MatTableDataSource<CitaProxima>([]);

  // Gráfica de Citas por Mes (Línea)
  citasChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Citas',
      data: [],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  citasChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  citasChartType: ChartType = 'line';

  // Gráfica de Tratamientos (Doughnut)
  tratamientosChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 4
    }]
  };

  tratamientosChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    }
  };

  tratamientosChartType: ChartType = 'doughnut';

  // Gráfica de Ingresos (Barras)
  ingresosChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Ingresos (Miles ₡)',
      data: [],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: '#667eea',
      borderWidth: 1
    }]
  };

  ingresosChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => {
            return `₡${context.parsed.y},000`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₡${value}k`
        }
      }
    }
  };

  ingresosChartType: ChartType = 'bar';

  // Gráfica de Pacientes (Pie)
  pacientesChartData: ChartData<'pie'> = {
    labels: ['Nuevos', 'Recurrentes'],
    datasets: [{
      data: [],
      backgroundColor: ['#43e97b', '#667eea'],
      hoverOffset: 4
    }]
  };

  pacientesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    }
  };

  pacientesChartType: ChartType = 'pie';

  constructor(private estadisticaService: EstadisticaService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.estadisticaService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.configurarGraficas();
        this.dataSource.data = data.proximasCitas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas', error);
        this.loading = false;
      }
    });
  }

  configurarGraficas(): void {
    if (!this.estadisticas) return;

    // Gráfica de Citas
    this.citasChartData.labels = this.estadisticas.citasPorMes.map(c => c.mes);
    this.citasChartData.datasets[0].data = this.estadisticas.citasPorMes.map(c => c.cantidad);

    // Gráfica de Tratamientos
    this.tratamientosChartData.labels = this.estadisticas.tratamientosMasRealizados.map(t => t.nombre);
    this.tratamientosChartData.datasets[0].data = this.estadisticas.tratamientosMasRealizados.map(t => t.cantidad);
    this.tratamientosChartData.datasets[0].backgroundColor = this.estadisticas.tratamientosMasRealizados.map(t => t.color);

    // Gráfica de Ingresos
    this.ingresosChartData.labels = this.estadisticas.ingresosMensuales.map(i => i.mes);
    this.ingresosChartData.datasets[0].data = this.estadisticas.ingresosMensuales.map(i => i.ingresos);

    // Gráfica de Pacientes
    this.pacientesChartData.datasets[0].data = [
      this.estadisticas.pacientesNuevosVsRecurrentes.nuevos,
      this.estadisticas.pacientesNuevosVsRecurrentes.recurrentes
    ];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(value);
  }

  getUrgenciaClass(urgencia: string): string {
    return `urgencia-${urgencia}`;
  }
}