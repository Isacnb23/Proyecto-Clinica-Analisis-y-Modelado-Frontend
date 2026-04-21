import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { TratamientoService } from '../../core/services/tratamiento.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatChipsModule,
    MatMenuModule, MatCardModule, MatSelectModule, MatDividerModule
  ],
  templateUrl: './tratamientos.component.html',
  styleUrl: './tratamientos.component.scss'
})
export class TratamientosComponent implements OnInit, AfterViewInit {

  // Columnas según los campos reales del TratamientoResponseDTO
  displayedColumns: string[] = ['nombre', 'paciente', 'profesional', 'costo', 'saldo', 'estado', 'acciones'];

  dataSource = new MatTableDataSource<any>([]);
  todos: any[] = [];

  // KPIs
  totalTratamientos    = 0;
  tratamientosActivos  = 0;   // estadoId === 1
  tratamientosInactivos = 0;  // estadoId === 3
  promedioPrecios      = 0;

  filtroEstado = 'todos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tratamientoService: TratamientoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row: any, f: string) => {
      const q = f.toLowerCase();
      return (row.nombre         || '').toLowerCase().includes(q)
          || (row.pacienteNombre || '').toLowerCase().includes(q)
          || (row.empleadoNombre || '').toLowerCase().includes(q)
          || (row.descripcion    || '').toLowerCase().includes(q);
    };
    this.cargarTratamientos();
  }

  cargarTratamientos(): void {
    this.tratamientoService.getTratamientos().subscribe({
      next: (data: any[]) => {
        this.todos = data;
        this.calcularKPIs(data);
        this.aplicarFiltro();
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort      = this.sort;
        }, 0);
      },
      error: () => this.toastr.error('Error al cargar tratamientos', 'Error')
    });
  }

  calcularKPIs(data: any[]): void {
    this.totalTratamientos     = data.length;
    this.tratamientosActivos   = data.filter(t => t.estadoId === 1).length;
    this.tratamientosInactivos = data.filter(t => t.estadoId === 3).length;
    const suma = data.reduce((s, t) => s + (t.costoTotal ?? 0), 0);
    this.promedioPrecios = data.length > 0 ? Math.round(suma / data.length) : 0;
  }

  aplicarFiltro(): void {
    const filtrado = this.filtroEstado === 'todos'       ? this.todos :
                     this.filtroEstado === 'proceso'     ? this.todos.filter(t => t.estadoId === 1) :
                     this.filtroEstado === 'completados' ? this.todos.filter(t => t.estadoId === 2) :
                     this.filtroEstado === 'cancelados'  ? this.todos.filter(t => t.estadoId === 3) :
                     this.todos;
    this.dataSource.data = filtrado;
  }

  onBuscar(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.dataSource.filter = v.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getEstadoLabel(id: number): string {
    return { 1:'En Proceso', 2:'Completado', 3:'Cancelado' }[id] ?? 'Desconocido';
  }

  getEstadoClass(id: number): string {
    return { 1:'chip-proceso', 2:'chip-completado', 3:'chip-cancelado' }[id] ?? '';
  }

  irAPaciente(t: any):     void { this.router.navigate(['/pacientes', t.pacienteId]); }
  editarTratamiento(t: any): void { this.router.navigate(['/tratamientos/editar', t.id]); }
  nuevoTratamiento():      void { this.router.navigate(['/tratamientos/nuevo']); }
  imprimirLista():         void { window.print(); }

  cancelarTratamiento(t: any): void {
    if (!confirm(`¿Cancelar "${t.nombre}" de ${t.pacienteNombre}?`)) return;
    this.tratamientoService.eliminarTratamiento(t.id).subscribe({
      next: () => { this.toastr.success('Tratamiento cancelado'); this.cargarTratamientos(); },
      error: () => this.toastr.error('Error al cancelar')
    });
  }

  fmt(v: number): string {
    return new Intl.NumberFormat('es-CR', { style:'currency', currency:'CRC', minimumFractionDigits:0 }).format(v ?? 0);
  }
}