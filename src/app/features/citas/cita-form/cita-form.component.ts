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
import { CitaService, Cita, Odontologo, Tratamiento } from '../../../core/services/cita.service';
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

  // Datos
  pacientes: Paciente[] = [];
  pacientesFiltrados!: Observable<Paciente[]>;
  odontologos: Odontologo[] = [];
  tratamientos: Tratamiento[] = [];
  horariosDisponibles: string[] = [];

  // Configuración
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
      pacienteId: ['', Validators.required],
      pacienteBusqueda: [''],
      odontologoId: ['', Validators.required],
      tratamientoId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      duracion: [30, [Validators.required, Validators.min(15)]],
      motivo: [''],
      observaciones: ['']
    });

    // Listener para cambios en fecha y odontólogo
    this.citaForm.get('fecha')?.valueChanges.subscribe(() => {
      this.cargarHorariosDisponibles();
    });

    this.citaForm.get('odontologoId')?.valueChanges.subscribe(() => {
      this.cargarHorariosDisponibles();
    });

    // Listener para cambios en tratamiento
    this.citaForm.get('tratamientoId')?.valueChanges.subscribe((id) => {
      const tratamiento = this.tratamientos.find(t => t.id === id);
      if (tratamiento) {
        this.duracionEstimada = tratamiento.duracionEstimada;
        this.citaForm.patchValue({ duracion: tratamiento.duracionEstimada });
      }
    });
  }

  cargarDatos(): void {
    // Cargar pacientes
    this.pacienteService.getPacientes().subscribe({
      next: (pacientes: any) => {
        this.pacientes = Array.isArray(pacientes) ? pacientes.filter((p: any) => p.activo) : [];
      },
      error: (error) => {
        this.toastr.error('Error al cargar pacientes', 'Error');
        console.error(error);
      }
    });

    // Cargar odontólogos
    this.citaService.getOdontologos().subscribe({
      next: (odontologos) => {
        this.odontologos = odontologos.filter(o => o.activo);
      },
      error: (error) => {
        this.toastr.error('Error al cargar odontólogos', 'Error');
        console.error(error);
      }
    });

    // Cargar tratamientos
    this.citaService.getTratamientos().subscribe({
      next: (tratamientos) => {
        this.tratamientos = tratamientos.filter(t => t.activo);
      },
      error: (error) => {
        this.toastr.error('Error al cargar tratamientos', 'Error');
        console.error(error);
      }
    });
  }

  configurarFiltros(): void {
    // Autocompletado de pacientes
    this.pacientesFiltrados = this.citaForm.get('pacienteBusqueda')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarPacientes(value || ''))
    );
  }

  private _filtrarPacientes(value: string): Paciente[] {
    const filterValue = value.toLowerCase();
    return this.pacientes.filter(p =>
      p.nombre.toLowerCase().includes(filterValue) ||
      p.apellidos.toLowerCase().includes(filterValue) ||
      p.cedula.includes(filterValue)
    );
  }

  seleccionarPaciente(paciente: Paciente): void {
    this.citaForm.patchValue({
      pacienteId: paciente.id,
      pacienteBusqueda: `${paciente.nombre} ${paciente.apellidos}`
    });
  }

  mostrarNombrePaciente(paciente: Paciente): string {
    return paciente ? `${paciente.nombre} ${paciente.apellidos}` : '';
  }

  cargarHorariosDisponibles(): void {
    const fecha = this.citaForm.get('fecha')?.value;
    const odontologoId = this.citaForm.get('odontologoId')?.value;

    if (fecha && odontologoId) {
      this.citaService.getHorariosDisponibles(fecha, odontologoId).subscribe({
        next: (horarios) => {
          this.horariosDisponibles = horarios;
        },
        error: (error) => {
          this.toastr.error('Error al cargar horarios', 'Error');
          console.error(error);
        }
      });
    }
  }

  verificarFechaPreseleccionada(): void {
    const fechaParam = this.route.snapshot.queryParamMap.get('fecha');
    if (fechaParam) {
      const fecha = new Date(fechaParam);
      this.citaForm.patchValue({ fecha: fecha });
    }
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private calcularHoraFin(horaInicio: string, duracion: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracion;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${String(nuevasHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}:00`;
  }

  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;

    // ✅ ESTRUCTURA CORRECTA PARA EL BACKEND
    const formData: Cita = {
      pacienteId: this.citaForm.value.pacienteId,
      empleadoId: this.citaForm.value.odontologoId,  // ✅ Usa empleadoId
      fecha: this.formatearFecha(this.citaForm.value.fecha),
      horaInicio: this.citaForm.value.hora + ':00',  // ✅ Formato HH:mm:ss
      horaFin: this.calcularHoraFin(this.citaForm.value.hora, this.citaForm.value.duracion),  // ✅
      motivo: this.citaForm.value.motivo,
      observaciones: this.citaForm.value.observaciones
    };

    console.log('Enviando cita:', formData);

    this.citaService.crearCita(formData).subscribe({
      next: (response) => {
        console.log('Cita creada:', response);
        this.toastr.success('Cita agendada correctamente', '¡Éxito!');
        this.router.navigate(['/citas']);
      },
      error: (error) => {
        console.error('Error al crear cita:', error);
        this.toastr.error(error.error?.message || 'Error al agendar la cita', 'Error');
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }

  // Getters
  get pacienteId() { return this.citaForm.get('pacienteId'); }
  get odontologoId() { return this.citaForm.get('odontologoId'); }
  get tratamientoId() { return this.citaForm.get('tratamientoId'); }
  get fecha() { return this.citaForm.get('fecha'); }
  get hora() { return this.citaForm.get('hora'); }
}
