import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../core/services/empleado.service';
import { Empleado, EstadisticasEmpleados } from '../../core/models/empleado.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule
  ],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss'
})
export class EmpleadosComponent implements OnInit {
  displayedColumns: string[] = [
    'codigo',
    'nombreCompleto',
    'cedula',
    'rol',
    'especialidad',
    'telefono',
    'email',
    'estado',
    'acciones'
  ];

  dataSource: MatTableDataSource<Empleado>;
  estadisticas?: EstadisticasEmpleados;
  rolFiltro?: Empleado['rol'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dataSource = new MatTableDataSource<Empleado>([]);
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarEstadisticas();
  }

  cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.dataSource.data = empleados;
        
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        // Configurar filtro personalizado
        this.dataSource.filterPredicate = (data: Empleado, filter: string) => {
          const searchStr = filter.toLowerCase();
          const nombreCompleto = `${data.nombre} ${data.apellido1} ${data.apellido2 || ''}`.toLowerCase();
          return nombreCompleto.includes(searchStr) ||
                 data.cedula.includes(searchStr) ||
                 data.codigo.toLowerCase().includes(searchStr) ||
                 data.email.toLowerCase().includes(searchStr);
        };
      },
      error: (error) => {
        this.toastr.error('Error al cargar empleados', 'Error');
        console.error(error);
      }
    });
  }

  cargarEstadisticas(): void {
    this.empleadoService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas', error);
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filtrarPorRol(rol?: Empleado['rol']): void {
    this.rolFiltro = rol;

    if (rol) {
      this.empleadoService.getEmpleadosByRol(rol).subscribe({
        next: (empleados) => {
          this.dataSource.data = empleados;
        }
      });
    } else {
      this.cargarEmpleados();
    }
  }

  getNombreCompleto(empleado: Empleado): string {
    return `${empleado.nombre} ${empleado.apellido1} ${empleado.apellido2 || ''}`.trim();
  }

  verDetalle(empleado: Empleado): void {
    this.router.navigate(['/empleados', empleado.id]);
  }

  editarEmpleado(empleado: Empleado): void {
    this.router.navigate(['/empleados', 'editar', empleado.id]);
  }

  eliminarEmpleado(empleado: Empleado): void {
    if (confirm(`¿Está seguro de desactivar al empleado ${this.getNombreCompleto(empleado)}?`)) {
      this.empleadoService.eliminarEmpleado(empleado.id).subscribe({
        next: () => {
          this.toastr.success('Empleado desactivado correctamente', 'Éxito');
          this.cargarEmpleados();
          this.cargarEstadisticas();
        },
        error: (error) => {
          this.toastr.error('Error al desactivar empleado', 'Error');
          console.error(error);
        }
      });
    }
  }

  activarEmpleado(empleado: Empleado): void {
    this.empleadoService.activarEmpleado(empleado.id).subscribe({
      next: () => {
        this.toastr.success('Empleado activado correctamente', 'Éxito');
        this.cargarEmpleados();
        this.cargarEstadisticas();
      },
      error: (error) => {
        this.toastr.error('Error al activar empleado', 'Error');
        console.error(error);
      }
    });
  }

  nuevoEmpleado(): void {
    this.router.navigate(['/empleados', 'nuevo']);
  }

  getRolClass(rol: string): string {
    return `rol-${rol.toLowerCase().replace(' ', '-')}`;
  }

  getRolIcon(rol: string): string {
    const icons: { [key: string]: string } = {
      'Administrador': 'admin_panel_settings',
      'Odontólogo': 'medical_services',
      'Asistente': 'support_agent',
      'Recepcionista': 'person'
    };
    return icons[rol] || 'person';
  }

  formatSalario(salario: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(salario);
  }
}