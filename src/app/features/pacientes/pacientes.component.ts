import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { Paciente } from '../../core/models/paciente.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription, filter } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-pacientes',
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
    MatDialogModule,
    MatDividerModule,
    MatSelectModule,
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'nombre',
    'apellidos',
    'cedula',
    'telefono',
    'email',
    'estado',
    'acciones'
  ];

  dataSource: MatTableDataSource<Paciente>;
  allPacientes: Paciente[] = [];
  totalPacientes = 0;
  pacientesActivos = 0;
  pacientesInactivos = 0;
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  private routerSubscription?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private pacienteService: PacienteService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<Paciente>([]);
  }

  ngOnInit(): void {
    this.cargarPacientes();

    // Suscribirse a eventos de navegación
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la ruta actual es /pacientes, recargar
      if (event.url === '/pacientes') {
        this.cargarPacientes();
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al destruir el componente
    this.routerSubscription?.unsubscribe();
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (pacientes) => {
        // Guardar todos los pacientes
        this.allPacientes = pacientes;
        this.dataSource.data = pacientes;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        // Esperar a que el paginador esté disponible
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        // Configurar filtro personalizado
        this.dataSource.filterPredicate = (data: Paciente, filter: string) => {
          const searchStr = filter.toLowerCase();
          return data.nombre.toLowerCase().includes(searchStr) ||
                 data.apellidos.toLowerCase().includes(searchStr) ||
                 data.cedula.includes(searchStr);
        };

        // Calcular estadísticas
        this.totalPacientes = pacientes.length;
        this.pacientesActivos = pacientes.filter(p => p.activo).length;
        this.pacientesInactivos = pacientes.filter(p => !p.activo).length;

        // Aplicar el filtro de estado actual
        this.aplicarFiltroEstado();

        // Forzar detección de cambios nuevamente
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Error al cargar pacientes', 'Error');
        console.error(error);
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
  filtrarPorEstado(): void {
    this.aplicarFiltroEstado();
  }

  private aplicarFiltroEstado(): void {
    if (this.filtroEstado === 'todos') {
      this.dataSource.data = this.allPacientes;
      return;
    }

    const filtrados = this.allPacientes.filter(p =>
      this.filtroEstado === 'activos' ? p.activo : !p.activo
    );

    this.dataSource.data = filtrados;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  getNombreCompleto(paciente: Paciente): string {
    return `${paciente.nombre} ${paciente.apellidos || ''}`.trim();
  }

  verDetalle(paciente: Paciente): void {
    this.router.navigate(['/pacientes', paciente.id]);
  }

  editarPaciente(paciente: Paciente): void {
    this.router.navigate(['/pacientes', 'editar', paciente.id]);
  }

  eliminarPaciente(paciente: Paciente): void {
    if (confirm(`¿Está seguro de desactivar al paciente ${this.getNombreCompleto(paciente)}?`)) {
      this.pacienteService.eliminarPaciente(paciente.id).subscribe({
        next: () => {
          this.toastr.success('Paciente desactivado correctamente', 'Éxito');
          this.filtroEstado = 'todos';  // Volver a todos para ver el inactivo
          this.cargarPacientes();
        },
        error: (error) => {
          this.toastr.error('Error al desactivar paciente', 'Error');
          console.error(error);
        }
      });
    }
  }

  activarPaciente(paciente: Paciente): void {
    if (confirm(`¿Está seguro de activar al paciente ${this.getNombreCompleto(paciente)}?`)) {
      this.pacienteService.activarPaciente(paciente.id).subscribe({
        next: () => {
          this.toastr.success('Paciente activado correctamente', 'Éxito');
          this.cargarPacientes();
        },
        error: (error) => {
          this.toastr.error('Error al activar paciente', 'Error');
          console.error(error);
        }
      });
    }
  }

  imprimirLista(): void { window.print(); }

  nuevoPaciente(): void {
    this.router.navigate(['/pacientes', 'nuevo']);
  }
}