import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { CitaService, Cita, Odontologo, TipoCita } from '../../../core/services/cita.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models/paciente.model';
import { ToastrService } from 'ngx-toastr';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatAutocompleteModule,
    MatDividerModule
  ],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss'
})
export class CitaFormComponent implements OnInit {
  citaForm!: FormGroup;
  loading = false;

  pacientes: Paciente[] = [];
  pacientesFiltrados!: Observable<Paciente[]>;
  odontologos: Odontologo[] = [];
  tratamientos: TipoCita[] = [];
  horariosDisponibles: string[] = [];

  minDate = new Date();
  duracionEstimada = 0;

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
    this.configurarFiltros();
    this.verificarFechaPreseleccionada();
  }

  initForm(): void {
    this.citaForm = this.fb.group({
      pacienteId:       ['', Validators.required],
      pacienteBusqueda: [''],
      odontologoId:     ['', Validators.required],
      tratamientoId:    ['', Validators.required],
      fecha:            ['', Validators.required],
      hora:             ['', Validators.required],
      duracion:         [30, [Validators.required, Validators.min(15)]],
      motivo:           [''],
      observaciones:    ['']
    });

    // Cuando cambia fecha u odontólogo → cargar horarios
    this.citaForm.get('fecha')?.valueChanges.subscribe(() => this.cargarHorariosDisponibles());
    this.citaForm.get('odontologoId')?.valueChanges.subscribe(() => this.cargarHorariosDisponibles());

    // Cuando cambia tratamiento → actualizar duración estimada
    this.citaForm.get('tratamientoId')?.valueChanges.subscribe((id) => {
      const t = this.tratamientos.find(x => x.id === id);
      if (t) {
        this.duracionEstimada = t.duracionEstimada;
        this.citaForm.patchValue({ duracion: t.duracionEstimada }, { emitEvent: false });
      }
    });
  }

  cargarDatos(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (pacientes: any) => {
        this.pacientes = Array.isArray(pacientes) ? pacientes.filter((p: any) => p.activo) : [];
      },
      error: () => this.toastr.error('Error al cargar pacientes', 'Error')
    });

    // ✅ Carga odontólogos REALES desde /api/Empleados
    this.citaService.getOdontologos().subscribe({
      next: (odontologos) => {
        this.odontologos = odontologos;
        if (odontologos.length === 0) {
          this.toastr.warning('No hay empleados activos registrados. Crea un empleado primero.', 'Aviso');
        }
      },
      error: () => this.toastr.error('Error al cargar odontólogos', 'Error')
    });

    this.citaService.getTratamientos().subscribe({
      next: (tratamientos) => { this.tratamientos = tratamientos; },
      error: () => this.toastr.error('Error al cargar tipos de cita', 'Error')
    });
  }

  configurarFiltros(): void {
    this.pacientesFiltrados = this.citaForm.get('pacienteBusqueda')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        // Si ya es un objeto Paciente seleccionado, mostrar todos
        if (value && typeof value === 'object') return this.pacientes.slice(0, 20);
        return this._filtrarPacientes(value || '');
      })
    );
  }

  private _filtrarPacientes(value: string): Paciente[] {
    const q = value.toLowerCase();
    return this.pacientes.filter(p =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.apellidos || '').toLowerCase().includes(q) ||
      (p.cedula || '').includes(q)
    ).slice(0, 20);
  }

  // ✅ FIX: no sobreescribir pacienteBusqueda con string
  // Dejamos que mat-autocomplete maneje el display con displayWith
  seleccionarPaciente(paciente: Paciente): void {
    this.citaForm.patchValue({ pacienteId: paciente.id }, { emitEvent: false });
  }

  // ✅ FIX: maneja tanto string como Paciente object de forma segura
  mostrarNombrePaciente = (value: Paciente | string | null): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return `${value.nombre || ''} ${value.apellidos || ''}`.trim();
  }

  cargarHorariosDisponibles(): void {
    const fecha = this.citaForm.get('fecha')?.value;
    const odontologoId = this.citaForm.get('odontologoId')?.value;
    if (fecha && odontologoId) {
      this.citaService.getHorariosDisponibles(fecha, odontologoId).subscribe({
        next: (horarios) => { this.horariosDisponibles = horarios; },
        error: () => { this.horariosDisponibles = []; }
      });
    }
  }

  verificarFechaPreseleccionada(): void {
    const fechaParam = this.route.snapshot.queryParamMap.get('fecha');
    if (fechaParam) {
      this.citaForm.patchValue({ fecha: new Date(fechaParam) });
    }
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private calcularHoraFin(horaInicio: string, duracion: number): string {
    const [h, min] = horaInicio.split(':').map(Number);
    const total = h * 60 + min + duracion;
    return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}:00`;
  }

  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    const v = this.citaForm.value;
    this.loading = true;

    const formData: Cita = {
      pacienteId:    v.pacienteId,
      empleadoId:    v.odontologoId,
      fecha:         this.formatearFecha(v.fecha),
      horaInicio:    v.hora + ':00',
      horaFin:       this.calcularHoraFin(v.hora, v.duracion),
      motivo:        v.motivo || 'Consulta dental',
      observaciones: v.observaciones || undefined
    };

    this.citaService.crearCita(formData).subscribe({
      next: () => {
        this.toastr.success('Cita agendada correctamente', '¡Éxito!');
        this.router.navigate(['/citas']);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al agendar la cita', 'Error');
        this.loading = false;
      }
    });
  }

  cancelar(): void { this.router.navigate(['/citas']); }

  get pacienteId()   { return this.citaForm.get('pacienteId'); }
  get odontologoId() { return this.citaForm.get('odontologoId'); }
  get tratamientoId(){ return this.citaForm.get('tratamientoId'); }
  get fecha()        { return this.citaForm.get('fecha'); }
  get hora()         { return this.citaForm.get('hora'); }
}