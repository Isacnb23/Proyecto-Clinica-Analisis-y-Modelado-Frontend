import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { HorariosService, BloqueDisponibilidad, ExcepcionHorario } from '../../core/services/horarios.service';
import { EmpleadosService } from '../../core/services/empleados.service';
import { AuthService } from '../../core/services/auth.service';
import { EmpleadoApi } from '../../core/models/empleado-api.model';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDividerModule, MatChipsModule
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss'
})
export class HorariosComponent implements OnInit {

  empleados: EmpleadoApi[] = [];
  empleadoSeleccionado: EmpleadoApi | null = null;

  bloques: BloqueDisponibilidad[] = [];
  excepciones: ExcepcionHorario[] = [];

  cargandoBloques   = false;
  cargandoExcep    = false;
  mostrarFormBloque = false;
  mostrarFormExcep  = false;

  esAdmin = false;

  diasSemana = [
    { valor: 0, nombre: 'Lunes' },
    { valor: 1, nombre: 'Martes' },
    { valor: 2, nombre: 'Miércoles' },
    { valor: 3, nombre: 'Jueves' },
    { valor: 4, nombre: 'Viernes' },
    { valor: 5, nombre: 'Sábado' },
    { valor: 6, nombre: 'Domingo' },
  ];

  // Form bloque
  formBloque = { diaSemana: 0, horaInicio: '08:00:00', horaFin: '17:00:00' };
  guardandoBloque = false;

  // Form excepción
  formExcep = { fechaInicio: '', fechaFin: '', tipo: 'Vacaciones', motivo: '' };
  guardandoExcep = false;
  tiposExcep = ['Vacaciones', 'Feriado', 'Licencia', 'Otro'];

  constructor(
    private horariosService: HorariosService,
    private empleadosService: EmpleadosService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    const rol = (user?.rol || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    this.esAdmin = rol === 'admin';

    // Cargar empleados — silencioso si no tiene permiso
    this.empleadosService.getEmpleados(true).pipe(
      catchError(() => of([]))
    ).subscribe(empleados => {
      this.empleados = empleados;
    });
  }

  onEmpleadoChange(): void {
    if (!this.empleadoSeleccionado) return;
    this.cargarBloques();
    this.cargarExcepciones();
  }

  cargarBloques(): void {
    if (!this.empleadoSeleccionado) return;
    this.cargandoBloques = true;
    this.horariosService.getBloques(this.empleadoSeleccionado.id).subscribe({
      next: (b) => { this.bloques = b; this.cargandoBloques = false; },
      error: () => { this.bloques = []; this.cargandoBloques = false; }
    });
  }

  cargarExcepciones(): void {
    if (!this.empleadoSeleccionado) return;
    this.cargandoExcep = true;
    this.horariosService.getExcepciones(this.empleadoSeleccionado.id).subscribe({
      next: (e) => { this.excepciones = e; this.cargandoExcep = false; },
      error: () => { this.excepciones = []; this.cargandoExcep = false; }
    });
  }

  getBloquesDelDia(dia: number): BloqueDisponibilidad[] {
    return this.bloques.filter(b => b.diaSemana === dia && b.activo);
  }

  formatHora(h: any): string {
    if (!h) return '';
    return h.toString().substring(0, 5);
  }

  // ── Bloque ──────────────────────────────────────────────────────────────
  abrirFormBloque(): void {
    this.formBloque = { diaSemana: 0, horaInicio: '08:00:00', horaFin: '17:00:00' };
    this.mostrarFormBloque = true;
  }

  guardarBloque(): void {
    if (!this.empleadoSeleccionado) return;
    this.guardandoBloque = true;
    const hi = this.formBloque.horaInicio.length === 5 ? this.formBloque.horaInicio + ':00' : this.formBloque.horaInicio;
    const hf = this.formBloque.horaFin.length === 5   ? this.formBloque.horaFin   + ':00' : this.formBloque.horaFin;
    this.horariosService.crearBloque(
      this.empleadoSeleccionado.id,
      this.formBloque.diaSemana,
      hi, hf
    ).subscribe({
      next: () => {
        this.toastr.success('Bloque agregado correctamente');
        this.mostrarFormBloque = false;
        this.guardandoBloque = false;
        this.cargarBloques();
      },
      error: (e: any) => {
        this.toastr.error(e?.error?.message || 'Error al agregar bloque');
        this.guardandoBloque = false;
      }
    });
  }

  eliminarBloque(bloqueId: number): void {
    if (!confirm('¿Eliminar este bloque?')) return;
    this.horariosService.eliminarBloque(bloqueId).subscribe({
      next: () => { this.toastr.success('Bloque eliminado'); this.cargarBloques(); },
      error: () => this.toastr.error('Error al eliminar bloque')
    });
  }

  // ── Excepción ────────────────────────────────────────────────────────────
  abrirFormExcep(): void {
    this.formExcep = { fechaInicio: '', fechaFin: '', tipo: 'Vacaciones', motivo: '' };
    this.mostrarFormExcep = true;
  }

  guardarExcepcion(): void {
    if (!this.empleadoSeleccionado) return;
    if (!this.formExcep.fechaInicio || !this.formExcep.fechaFin) {
      this.toastr.warning('Las fechas son requeridas'); return;
    }
    this.guardandoExcep = true;
    this.horariosService.crearExcepcion(this.empleadoSeleccionado.id, {
      fechaInicio: new Date(this.formExcep.fechaInicio).toISOString(),
      fechaFin:    new Date(this.formExcep.fechaFin).toISOString(),
      tipo:        this.formExcep.tipo,
      motivo:      this.formExcep.motivo
    }).subscribe({
      next: () => {
        this.toastr.success('Excepción registrada correctamente');
        this.mostrarFormExcep = false;
        this.guardandoExcep = false;
        this.cargarExcepciones();
      },
      error: (e: any) => {
        this.toastr.error(e?.error?.message || 'Error al registrar excepción');
        this.guardandoExcep = false;
      }
    });
  }

  eliminarExcepcion(id: number): void {
    if (!confirm('¿Eliminar esta excepción?')) return;
    this.horariosService.eliminarExcepcion(id).subscribe({
      next: () => { this.toastr.success('Excepción eliminada'); this.cargarExcepciones(); },
      error: () => this.toastr.error('Error al eliminar excepción')
    });
  }
}