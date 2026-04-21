import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { EmpleadosService } from '../../core/services/empleados.service';
import { EmpleadoApi } from '../../core/models/empleado-api.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss'
})
export class EmpleadosComponent implements OnInit {
  empleados: EmpleadoApi[] = [];
  empleadosFiltrados: EmpleadoApi[] = [];

  searchTerm = '';
  estadoFiltro = 'todos';
  loading = false;

  constructor(
    private empleadosService: EmpleadosService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.loading = true;

    this.empleadosService.getEmpleados().subscribe({
      next: (data: EmpleadoApi[]) => {
        this.empleados = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.toast.httpError(error, 'No fue posible cargar los empleados');
      }
    });
  }

  aplicarFiltros(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.empleadosFiltrados = this.empleados.filter((emp: EmpleadoApi) => {
      const matchesText =
        !term ||
        emp.codigo.toLowerCase().includes(term) ||
        emp.nombre.toLowerCase().includes(term) ||
        emp.apellidos.toLowerCase().includes(term) ||
        emp.cedula.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        (emp.usuarioEmail || '').toLowerCase().includes(term);

      const matchesEstado =
        this.estadoFiltro === 'todos' ||
        (this.estadoFiltro === 'activos' && emp.activo) ||
        (this.estadoFiltro === 'inactivos' && !emp.activo);

      return matchesText && matchesEstado;
    });
  }

  nuevoEmpleado(): void {
    this.router.navigate(['/empleados/nuevo']);
  }

  editarEmpleado(id: number): void {
    this.router.navigate(['/empleados/editar', id]);
  }

  cambiarEstado(empleado: EmpleadoApi): void {
    const accion = empleado.activo ? 'desactivar' : 'activar';
    const confirmado = confirm(`¿Deseas ${accion} al empleado ${empleado.nombre} ${empleado.apellidos}?`);

    if (!confirmado) return;

    const request = empleado.activo
      ? this.empleadosService.desactivarEmpleado(empleado.id)
      : this.empleadosService.activarEmpleado(empleado.id);

    request.subscribe({
      next: () => {
        this.toast.success(`Empleado ${empleado.activo ? 'desactivado' : 'activado'} correctamente`);
        this.cargarEmpleados();
      },
      error: (error: any) => {
        this.toast.httpError(error, 'No fue posible actualizar el estado del empleado');
      }
    });
  }

  getEstadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}