import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CitaService } from '../../core/services/cita.service';
import { Cita } from '../../core/models/cita.model';
import { ToastrService } from 'ngx-toastr';

interface DiaCalendario {
  fecha: Date;
  dia: number;
  esHoy: boolean;
  esMesActual: boolean;
  citas: Cita[];
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.scss'
})
export class CitasComponent implements OnInit {
  // Calendario
  fechaActual = new Date();
  mesActual: DiaCalendario[] = [];
  nombreMes = '';
  año = 0;

  // Estadísticas
  totalCitas = 0;
  citasHoy = 0;
  citasPendientes = 0;
  citasConfirmadas = 0;

  // Tabla
  displayedColumns: string[] = ['fecha', 'hora', 'paciente', 'odontologo', 'tratamiento', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Cita>([]);

  // Datos
  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  constructor(
    private citaService: CitaService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (citas) => {
        this.todasLasCitas = citas;
        this.calcularEstadisticas();
        this.generarCalendario();
        this.filtrarCitasMesActual();
      },
      error: (error) => {
        this.toastr.error('Error al cargar las citas', 'Error');
        console.error(error);
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalCitas = this.todasLasCitas.length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    this.citasHoy = this.todasLasCitas.filter(c => {
      const fechaCita = new Date(c.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      return fechaCita.getTime() === hoy.getTime();
    }).length;

    this.citasPendientes = this.todasLasCitas.filter(c => c.estado === 'pendiente').length;
    this.citasConfirmadas = this.todasLasCitas.filter(c => c.estado === 'confirmada').length;
  }

  generarCalendario(): void {
    const primerDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
    const ultimoDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
    
    this.nombreMes = this.fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    this.año = this.fechaActual.getFullYear();

    const dias: DiaCalendario[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Días del mes anterior para completar la primera semana
    const primerDiaSemana = primerDia.getDay();
    const diasMesAnterior = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    
    for (let i = diasMesAnterior; i > 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i);
      dias.push({
        fecha: fecha,
        dia: fecha.getDate(),
        esHoy: false,
        esMesActual: false,
        citas: this.getCitasPorFecha(fecha)
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia);
      fecha.setHours(0, 0, 0, 0);
      
      dias.push({
        fecha: fecha,
        dia: dia,
        esHoy: fecha.getTime() === hoy.getTime(),
        esMesActual: true,
        citas: this.getCitasPorFecha(fecha)
      });
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - dias.length; // 6 semanas x 7 días = 42
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(ultimoDia);
      fecha.setDate(fecha.getDate() + i);
      dias.push({
        fecha: fecha,
        dia: fecha.getDate(),
        esHoy: false,
        esMesActual: false,
        citas: this.getCitasPorFecha(fecha)
      });
    }

    this.mesActual = dias;
  }

  getCitasPorFecha(fecha: Date): Cita[] {
    return this.todasLasCitas.filter(c => {
      const fechaCita = new Date(c.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      const fechaBuscar = new Date(fecha);
      fechaBuscar.setHours(0, 0, 0, 0);
      return fechaCita.getTime() === fechaBuscar.getTime();
    });
  }

  filtrarCitasMesActual(): void {
    this.citasFiltradas = this.todasLasCitas.filter(c => {
      const fechaCita = new Date(c.fecha);
      return fechaCita.getMonth() === this.fechaActual.getMonth() &&
             fechaCita.getFullYear() === this.fechaActual.getFullYear();
    });
    this.dataSource.data = this.citasFiltradas;
  }

  mesAnterior(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() - 1);
    this.generarCalendario();
    this.filtrarCitasMesActual();
  }

  mesSiguiente(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + 1);
    this.generarCalendario();
    this.filtrarCitasMesActual();
  }

  hoy(): void {
    this.fechaActual = new Date();
    this.generarCalendario();
    this.filtrarCitasMesActual();
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (dia.citas.length > 0) {
      this.dataSource.data = dia.citas;
    } else {
      // Navegar a crear cita con fecha preseleccionada
      this.nuevaCita(dia.fecha);
    }
  }

  nuevaCita(fecha?: Date): void {
    const fechaParam = fecha ? fecha.toISOString() : '';
    this.router.navigate(['/citas/nueva'], { queryParams: { fecha: fechaParam } });
  }

  verDetalle(cita: Cita): void {
    this.router.navigate(['/citas', cita.id]);
  }

  confirmarCita(cita: Cita): void {
    this.citaService.confirmarCita(cita.id).subscribe({
      next: () => {
        this.toastr.success('Cita confirmada correctamente', 'Éxito');
        this.cargarCitas();
      },
      error: (error) => {
        this.toastr.error('Error al confirmar la cita', 'Error');
        console.error(error);
      }
    });
  }

  completarCita(cita: Cita): void {
    this.citaService.completarCita(cita.id).subscribe({
      next: () => {
        this.toastr.success('Cita completada correctamente', 'Éxito');
        this.cargarCitas();
      },
      error: (error) => {
        this.toastr.error('Error al completar la cita', 'Error');
        console.error(error);
      }
    });
  }

  cancelarCita(cita: Cita): void {
    if (confirm(`¿Está seguro de cancelar la cita de ${cita.pacienteNombre}?`)) {
      this.citaService.cancelarCita(cita.id).subscribe({
        next: () => {
          this.toastr.success('Cita cancelada correctamente', 'Éxito');
          this.cargarCitas();
        },
        error: (error) => {
          this.toastr.error('Error al cancelar la cita', 'Error');
          console.error(error);
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado}`;
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  }
}