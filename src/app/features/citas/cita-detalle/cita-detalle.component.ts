import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CitaService, Cita } from '../../../core/services/cita.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
<div class="detalle-wrap">

  <!-- HEADER -->
  <div class="det-header">
    <button class="btn-back" (click)="volver()">
      <mat-icon>arrow_back</mat-icon> Volver
    </button>
    <h1><mat-icon>event</mat-icon> Detalle de Cita</h1>
  </div>

  <!-- LOADING -->
  <div *ngIf="cargando" class="loading">Cargando cita...</div>

  <!-- ERROR -->
  <div *ngIf="!cargando && !cita" class="error-card">
    <mat-icon>error_outline</mat-icon>
    <p>No se encontró la cita solicitada.</p>
    <button mat-raised-button (click)="volver()">Volver a Citas</button>
  </div>

  <!-- CONTENIDO -->
  <div *ngIf="!cargando && cita" class="det-body">

    <!-- Estado badge y acciones rápidas -->
    <div class="estado-bar">
      <span class="estado-badge" [class]="getEstadoClass(cita.estado || '')">
        <mat-icon>{{ getEstadoIcon(cita.estado || '') }}</mat-icon>
        {{ cita.estado }}
      </span>
      <div class="acciones-rapidas">
        <button mat-stroked-button color="primary"
          *ngIf="cita.estado === 'Pendiente'"
          (click)="confirmar()">
          <mat-icon>check_circle</mat-icon> Confirmar
        </button>
        <button mat-stroked-button color="accent"
          *ngIf="cita.estado === 'Confirmada'"
          (click)="completar()">
          <mat-icon>done_all</mat-icon> Completar
        </button>
        <button mat-stroked-button color="warn"
          *ngIf="cita.estado !== 'Cancelada' && cita.estado !== 'Completada'"
          (click)="cancelar()">
          <mat-icon>cancel</mat-icon> Cancelar
        </button>
      </div>
    </div>

    <div class="cards-grid">

      <!-- INFORMACIÓN DE LA CITA -->
      <div class="det-card">
        <h2><mat-icon>event_note</mat-icon> Información de la Cita</h2>
        <mat-divider></mat-divider>

        <div class="field-list">
          <div class="field">
            <span class="field-label">Número de Cita</span>
            <span class="field-val"># {{ cita.id }}</span>
          </div>
          <div class="field">
            <span class="field-label">Fecha</span>
            <span class="field-val">{{ cita.fecha | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Hora de Inicio</span>
            <span class="field-val">{{ formatHora(cita.horaInicio) }}</span>
          </div>
          <div class="field">
            <span class="field-label">Hora de Fin</span>
            <span class="field-val">{{ formatHora(cita.horaFin) }}</span>
          </div>
          <div class="field">
            <span class="field-label">Duración</span>
            <span class="field-val">{{ calcularDuracion(cita.horaInicio, cita.horaFin) }}</span>
          </div>
          <div class="field">
            <span class="field-label">Motivo</span>
            <span class="field-val">{{ cita.motivo || '—' }}</span>
          </div>
          <div class="field" *ngIf="cita.observaciones">
            <span class="field-label">Observaciones</span>
            <span class="field-val">{{ cita.observaciones }}</span>
          </div>
          <div class="field">
            <span class="field-label">Registrada el</span>
        </div>
      </div>

      <!-- PACIENTE -->
      <div class="det-card">
        <h2><mat-icon>person</mat-icon> Paciente</h2>
        <mat-divider></mat-divider>

        <div class="persona-avatar">
          <div class="avatar-circle">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div>
            <p class="persona-nombre">{{ cita.pacienteNombre }} {{ cita.pacienteApellidos }}</p>
            <p class="persona-cedula">Cédula: {{ cita.pacienteCedula }}</p>
          </div>
        </div>

        <div class="field-list" style="margin-top:1rem">
          <div class="field">
            <span class="field-label">ID Paciente</span>
            <span class="field-val"># {{ cita.pacienteId }}</span>
          </div>
          <div class="field">
            <span class="field-label">Nombre completo</span>
            <span class="field-val">{{ cita.pacienteNombre }} {{ cita.pacienteApellidos }}</span>
          </div>
          <div class="field">
            <span class="field-label">Cédula</span>
            <span class="field-val">{{ cita.pacienteCedula }}</span>
          </div>
        </div>

        <button mat-stroked-button class="btn-ver-paciente"
          (click)="verPaciente()">
          <mat-icon>person_search</mat-icon> Ver perfil del paciente
        </button>
      </div>

      <!-- ODONTÓLOGO -->
      <div class="det-card">
        <h2><mat-icon>medical_services</mat-icon> Profesional</h2>
        <mat-divider></mat-divider>

        <div class="persona-avatar">
          <div class="avatar-circle prof">
            <mat-icon>stethoscope</mat-icon>
          </div>
          <div>
            <p class="persona-nombre">{{ cita.empleadoNombre }} {{ cita.empleadoApellidos }}</p>
            <p class="persona-cedula">{{ cita.empleadoEspecialidad || 'Sin especialidad' }}</p>
          </div>
        </div>

        <div class="field-list" style="margin-top:1rem">
          <div class="field">
            <span class="field-label">ID Empleado</span>
            <span class="field-val"># {{ cita.empleadoId }}</span>
          </div>
          <div class="field">
            <span class="field-label">Especialidad</span>
            <span class="field-val">{{ cita.empleadoEspecialidad || '—' }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
  `,
  styles: [`
    .detalle-wrap { padding: 2rem; max-width: 1100px; margin: 0 auto; }

    .det-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .det-header h1 { margin: 0; color: #1a365d; font-size: 1.6rem; display: flex; align-items: center; gap: .5rem; }
    .btn-back { display: flex; align-items: center; gap: .3rem; background: none; border: 1px solid #d1d5db; border-radius: 6px; padding: .4rem .9rem; cursor: pointer; color: #374151; font-size: .95rem; }
    .btn-back:hover { background: #f9fafb; }

    .loading { text-align: center; padding: 3rem; color: #9ca3af; font-size: 1.1rem; }

    .error-card { text-align: center; padding: 3rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .error-card mat-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #ef4444; }
    .error-card p { color: #6b7280; margin: 1rem 0; }

    .estado-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .estado-badge { display: flex; align-items: center; gap: .4rem; padding: .4rem 1rem; border-radius: 20px; font-weight: 600; font-size: .95rem; }
    .estado-badge mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .badge-pendiente   { background: #fef3c7; color: #92400e; }
    .badge-confirmada  { background: #dbeafe; color: #1e40af; }
    .badge-completada  { background: #d1fae5; color: #065f46; }
    .badge-cancelada   { background: #fee2e2; color: #991b1b; }
    .acciones-rapidas  { display: flex; gap: .75rem; flex-wrap: wrap; }

    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .cards-grid > .det-card:first-child { grid-column: 1 / -1; }
    @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } .cards-grid > .det-card:first-child { grid-column: auto; } }

    .det-card { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .det-card h2 { margin: 0 0 1rem; color: #1a365d; font-size: 1.05rem; display: flex; align-items: center; gap: .4rem; }
    .det-card h2 mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; color: #c9a227; }

    .field-list { margin-top: 1rem; }
    .field { display: flex; justify-content: space-between; padding: .6rem 0; border-bottom: 1px solid #f1f5f9; }
    .field:last-child { border-bottom: none; }
    .field-label { color: #6b7280; font-size: .9rem; }
    .field-val { color: #111827; font-weight: 500; text-align: right; max-width: 60%; }

    .persona-avatar { display: flex; align-items: center; gap: 1rem; padding: .75rem 0; }
    .avatar-circle { width: 52px; height: 52px; border-radius: 50%; background: #1a365d; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .avatar-circle mat-icon { color: white; font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    .avatar-circle.prof { background: #c9a227; }
    .persona-nombre { margin: 0; font-weight: 600; color: #111827; font-size: 1rem; }
    .persona-cedula { margin: .2rem 0 0; color: #6b7280; font-size: .88rem; }

    .btn-ver-paciente { margin-top: 1rem; width: 100%; }
  `]
})
export class CitaDetalleComponent implements OnInit {
  cita: Cita | null = null;
  cargando = true;
  citaId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCita();
  }

  cargarCita(): void {
    this.cargando = true;
    this.citaService.getCitaById(this.citaId).subscribe({
      next: (cita) => { this.cita = cita; this.cargando = false; },
      error: () => { this.cargando = false; this.toastr.error('No se pudo cargar la cita', 'Error'); }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'estado-badge badge-pendiente',
      'Confirmada': 'estado-badge badge-confirmada',
      'Completada': 'estado-badge badge-completada',
      'Cancelada':  'estado-badge badge-cancelada'
    };
    return map[estado] || 'estado-badge badge-pendiente';
  }

  getEstadoIcon(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'schedule',
      'Confirmada': 'check_circle',
      'Completada': 'done_all',
      'Cancelada':  'cancel'
    };
    return map[estado] || 'schedule';
  }

  formatHora(hora: any): string {
    if (!hora) return '—';
    const str = hora.toString();
    // puede venir como "08:00:00" o "08:00"
    return str.substring(0, 5);
  }

  calcularDuracion(inicio: any, fin: any): string {
    if (!inicio || !fin) return '—';
    const [h1, m1] = inicio.toString().split(':').map(Number);
    const [h2, m2] = fin.toString().split(':').map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return '—';
    if (mins < 60) return `${mins} minutos`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h} hora${h > 1 ? 's' : ''}`;
  }

  confirmar(): void {
    if (!this.cita?.id) return;
    if (!confirm('¿Confirmar esta cita?')) return;
    this.citaService.confirmarCita(this.cita.id).subscribe({
      next: () => { this.toastr.success('Cita confirmada'); this.cargarCita(); },
      error: (e) => this.toastr.error(e.error?.message || 'Error al confirmar')
    });
  }

  completar(): void {
    if (!this.cita?.id) return;
    if (!confirm('¿Marcar esta cita como completada?')) return;
    this.citaService.completarCita(this.cita.id).subscribe({
      next: () => { this.toastr.success('Cita completada'); this.cargarCita(); },
      error: (e) => this.toastr.error(e.error?.message || 'Error al completar')
    });
  }

  cancelar(): void {
    if (!this.cita?.id) return;
    if (!confirm('¿Cancelar esta cita?')) return;
    this.citaService.cancelarCita(this.cita.id).subscribe({
      next: () => { this.toastr.success('Cita cancelada'); this.cargarCita(); },
      error: (e) => this.toastr.error(e.error?.message || 'Error al cancelar')
    });
  }

  verPaciente(): void {
    if (this.cita?.pacienteId) {
      this.router.navigate(['/pacientes', this.cita.pacienteId]);
    }
  }

  volver(): void {
    this.router.navigate(['/citas']);
  }
}