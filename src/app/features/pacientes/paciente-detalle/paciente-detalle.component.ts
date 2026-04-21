import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente.service';
import { CitaService, Cita } from '../../../core/services/cita.service';
import { TratamientoService } from '../../../core/services/tratamiento.service';
import { Paciente } from '../../../core/models/paciente.model';
import { Tratamiento } from '../../../core/models/tratamiento.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './paciente-detalle.component.html',
  styleUrl: './paciente-detalle.component.scss'
})
export class PacienteDetalleComponent implements OnInit {
  paciente?: Paciente;
  citas: Cita[] = [];
  tratamientos: Tratamiento[] = [];
  loading = true;
  cargandoCitas = false;
  cargandoTratamientos = false;

  tabActivo = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private tratamientoService: TratamientoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPaciente(Number(id));
    }
  }

  cargarPaciente(id: number): void {
    this.pacienteService.getPacienteById(id).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
        this.loading = false;
        // Cargar datos de las otras pestañas en paralelo
        this.cargarCitas(id);
        this.cargarTratamientos(id);
      },
      error: () => {
        this.toastr.error('Error al cargar el paciente', 'Error');
        this.loading = false;
        this.router.navigate(['/pacientes']);
      }
    });
  }

  cargarCitas(pacienteId: number): void {
    this.cargandoCitas = true;
    this.citaService.getCitasByPaciente(pacienteId).subscribe({
      next: (citas) => { this.citas = citas; this.cargandoCitas = false; },
      error: () => { this.citas = []; this.cargandoCitas = false; }
    });
  }

  cargarTratamientos(pacienteId: number): void {
    this.cargandoTratamientos = true;
    this.tratamientoService.getTratamientos().subscribe({
      next: (todos: any[]) => {
        // Filtrar por pacienteId
        this.tratamientos = todos.filter((t: any) => t.pacienteId === pacienteId);
        this.cargandoTratamientos = false;
      },
      error: () => { this.tratamientos = []; this.cargandoTratamientos = false; }
    });
  }

  getNombreCompleto(): string {
    if (!this.paciente) return '';
    return `${this.paciente.nombre} ${this.paciente.apellidos || ''}`.trim();
  }

  editarPaciente(): void {
    this.router.navigate(['/pacientes', 'editar', this.paciente?.id]);
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  // ✅ Navega al formulario de nueva cita con paciente preseleccionado
  agendarCita(): void {
    this.router.navigate(['/citas', 'nueva'], {
      queryParams: { pacienteId: this.paciente?.id }
    });
  }

  verDetalleCita(cita: Cita): void {
    this.router.navigate(['/citas', cita.id]);
  }

  getEstadoClass(estado?: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'badge-pend',
      'Confirmada': 'badge-conf',
      'Completada': 'badge-comp',
      'Cancelada':  'badge-canc'
    };
    return map[estado || ''] || 'badge-pend';
  }

  formatHora(hora: any): string {
    if (!hora) return '—';
    return hora.toString().substring(0, 5);
  }

  getSaldoClass(t: any): string {
    return (t.saldo ?? t.costoTotal) > 0 ? 'saldo-pend' : 'saldo-ok';
  }
}