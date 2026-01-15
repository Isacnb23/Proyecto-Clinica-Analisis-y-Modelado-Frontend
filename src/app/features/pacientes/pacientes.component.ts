import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
    MatDividerModule
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'numeroExpediente',
    'nombreCompleto',
    'cedula',
    'edad',
    'telefono',
    'email',
    'ultimaVisita',
    'estado',
    'acciones'
  ];

  dataSource: MatTableDataSource<Paciente>;
  totalPacientes = 0;
  pacientesActivos = 0;
  pacientesInactivos = 0;

  private routerSubscription?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private pacienteService: PacienteService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
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
        this.dataSource.data = pacientes;
        
        // Esperar a que el paginador esté disponible
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        
        // Configurar filtro personalizado
        this.dataSource.filterPredicate = (data: Paciente, filter: string) => {
          const searchStr = filter.toLowerCase();
          return data.nombre.toLowerCase().includes(searchStr) ||
                 data.apellido1.toLowerCase().includes(searchStr) ||
                 (data.apellido2?.toLowerCase().includes(searchStr) || false) ||
                 data.cedula.includes(searchStr) ||
                 data.numeroExpediente.toLowerCase().includes(searchStr);
        };

        // Calcular estadísticas
        this.totalPacientes = pacientes.length;
        this.pacientesActivos = pacientes.filter(p => p.activo).length;
        this.pacientesInactivos = pacientes.filter(p => !p.activo).length;
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

  getNombreCompleto(paciente: Paciente): string {
    return `${paciente.nombre} ${paciente.apellido1} ${paciente.apellido2 || ''}`.trim();
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

  nuevoPaciente(): void {
    this.router.navigate(['/pacientes', 'nuevo']);
  }
}