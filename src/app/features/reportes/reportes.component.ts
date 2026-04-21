import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { EmpleadosService } from '../../core/services/empleados.service';
import { InventarioService } from '../../core/services/inventario.service';
import { TratamientoService } from '../../core/services/tratamiento.service';
import { catchError, of } from 'rxjs';

type TipoReporte = 'pacientes' | 'citas' | 'empleados' | 'inventario' | 'tratamientos';

interface ReporteCard {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule, MatChipsModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {

  reporteActivo: TipoReporte | null = null;
  cargando = false;
  datos: any[] = [];
  generadoEl = '';

  reportes: ReporteCard[] = [
    { tipo: 'pacientes',    titulo: 'Pacientes',    descripcion: 'Listado completo de pacientes registrados',  icon: 'people',           color: '#1e3a5f' },
    { tipo: 'citas',        titulo: 'Citas',         descripcion: 'Historial de citas programadas y realizadas', icon: 'event',            color: '#0284c7' },
    { tipo: 'empleados',    titulo: 'Empleados',     descripcion: 'Personal activo de la clínica',               icon: 'badge',            color: '#7c3aed' },
    { tipo: 'inventario',   titulo: 'Inventario',    descripcion: 'Stock actual de productos e insumos',          icon: 'inventory_2',      color: '#c2410c' },
    { tipo: 'tratamientos', titulo: 'Tratamientos',  descripcion: 'Tratamientos y estado de pagos',              icon: 'medical_services', color: '#065f46' },
  ];

  columnas: Record<TipoReporte, string[]> = {
    pacientes:    ['#', 'Nombre', 'Apellidos', 'Cédula', 'Teléfono', 'Email', 'Estado'],
    citas:        ['#', 'Fecha', 'Hora', 'Paciente', 'Profesional', 'Motivo', 'Estado'],
    empleados:    ['#', 'Nombre', 'Apellidos', 'Cédula', 'Rol', 'Especialidad', 'Estado'],
    inventario:   ['#', 'Código', 'Producto', 'Stock', 'Stock mín.', 'Precio unit.', 'Estado'],
    tratamientos: ['#', 'Paciente', 'Tratamiento', 'Profesional', 'Costo', 'Pagado', 'Saldo'],
  };

  constructor(
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private empleadosService: EmpleadosService,
    private inventarioService: InventarioService,
    private tratamientoService: TratamientoService
  ) {}

  ngOnInit(): void {}

  get tituloActivo(): string {
    return this.reportes.find(r => r.tipo === this.reporteActivo)?.titulo || '';
  }

  get columnasActivas(): string[] {
    return this.reporteActivo ? this.columnas[this.reporteActivo] : [];
  }

  cargar(tipo: TipoReporte): void {
    this.reporteActivo = tipo;
    this.cargando = true;
    this.datos = [];
    this.generadoEl = new Date().toLocaleString('es-CR');

    const mapa: Record<TipoReporte, any> = {
      pacientes:    this.pacienteService.getPacientes().pipe(catchError(() => of([]))),
      citas:        this.citaService.getCitas().pipe(catchError(() => of([]))),
      empleados:    this.empleadosService.getEmpleados().pipe(catchError(() => of([]))),
      inventario:   this.inventarioService.getProductos().pipe(catchError(() => of([]))),
      tratamientos: this.tratamientoService.getTratamientos().pipe(catchError(() => of([]))),
    };
    const obs$: any = mapa[tipo];

    obs$.subscribe({
      next: (data: any[]) => { this.datos = data; this.cargando = false; },
      error: () => { this.datos = []; this.cargando = false; }
    });
  }

  volver(): void {
    this.reporteActivo = null;
    this.datos = [];
  }

  imprimir(): void { window.print(); }

  // ── Helpers para cada tipo ────────────────────────────────────────────────
  getCeldas(row: any): string[] {
    switch (this.reporteActivo) {
      case 'pacientes':
        return [
          row.nombre || '',
          row.apellidos || '',
          row.cedula || '',
          row.telefono || '',
          row.email || '—',
          row.activo ? 'Activo' : 'Inactivo'
        ];
      case 'citas':
        return [
          (row.fecha ? new Date(row.fecha).toLocaleDateString('es-CR') : ''),
          this.fmtHora(row.horaInicio),
          `${row.pacienteNombre || ''} ${row.pacienteApellidos || ''}`.trim(),
          `${row.empleadoNombre || ''} ${row.empleadoApellidos || ''}`.trim(),
          row.motivo || '—',
          row.estado || ''
        ];
      case 'empleados':
        return [
          row.nombre || '',
          row.apellidos || '',
          row.cedula || '',
          row.rol || '',
          row.especialidad || '—',
          row.activo ? 'Activo' : 'Inactivo'
        ];
      case 'inventario':
        return [
          row.codigo || '',
          row.nombre || '',
          String(row.stockActual ?? 0),
          String(row.stockMinimo ?? 0),
          `₡${(row.precioUnitario ?? row.costoUnitario ?? 0).toLocaleString('es-CR')}`,
          row.activo !== false ? 'Activo' : 'Inactivo'
        ];
      case 'tratamientos':
        return [
          row.pacienteNombre || `Paciente #${row.pacienteId}`,
          row.nombre || '',
          row.empleadoNombre || '—',
          `₡${(row.costoTotal ?? 0).toLocaleString('es-CR')}`,
          `₡${(row.montoPagado ?? 0).toLocaleString('es-CR')}`,
          `₡${(row.saldo ?? 0).toLocaleString('es-CR')}`
        ];
      default: return [];
    }
  }

  getEstadoCelda(celda: string): string {
    if (celda === 'Activo')    return 'est-activo';
    if (celda === 'Inactivo')  return 'est-inactivo';
    if (celda === 'Pendiente') return 'est-pend';
    if (celda === 'Completada'|| celda === 'Confirmada') return 'est-comp';
    if (celda === 'Cancelada') return 'est-canc';
    return '';
  }

  private fmtHora(h: any): string {
    if (!h) return '';
    return h.toString().substring(0, 5);
  }

  getEstadoClass(row: any): string {
    switch (this.reporteActivo) {
      case 'pacientes':
      case 'empleados': return row.activo ? 'est-activo' : 'est-inactivo';
      case 'citas': {
        const m: Record<string,string> = { Pendiente:'est-pend', Confirmada:'est-conf', Completada:'est-comp', Cancelada:'est-canc' };
        return m[row.estado] || '';
      }
      case 'tratamientos': return (row.saldo ?? 0) > 0 ? 'est-pend' : 'est-comp';
      default: return '';
    }
  }
}