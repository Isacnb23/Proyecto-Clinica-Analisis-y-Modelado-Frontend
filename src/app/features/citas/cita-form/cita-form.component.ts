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
import { CitaService } from '../../../core/services/cita.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Odontologo, Tratamiento } from '../../../core/models/cita.model';
import { Paciente } from '../../../core/models/paciente.model';
import { ToastrService } from 'ngx-toastr';
import { Observable, startWith, map } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';

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
      next: (pacientes) => {
        this.pacientes = pacientes.filter(p => p.activo);
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
      p.apellido1.toLowerCase().includes(filterValue) ||
      p.cedula.includes(filterValue)
    );
  }

  seleccionarPaciente(paciente: Paciente): void {
    this.citaForm.patchValue({
      pacienteId: paciente.id,
      pacienteBusqueda: `${paciente.nombre} ${paciente.apellido1} ${paciente.apellido2 || ''}`
    });
  }

  mostrarNombrePaciente(paciente: Paciente): string {
    return paciente ? `${paciente.nombre} ${paciente.apellido1} ${paciente.apellido2 || ''}` : '';
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

  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;

    const formData = {
      pacienteId: this.citaForm.value.pacienteId,
      odontologoId: this.citaForm.value.odontologoId,
      tratamientoId: this.citaForm.value.tratamientoId,
      fecha: this.citaForm.value.fecha,
      hora: this.citaForm.value.hora,
      duracion: this.citaForm.value.duracion,
      motivo: this.citaForm.value.motivo,
      observaciones: this.citaForm.value.observaciones
    };

    this.citaService.crearCita(formData).subscribe({
      next: () => {
        this.toastr.success('Cita agendada correctamente', '¡Éxito!');
        this.router.navigate(['/citas']).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        this.toastr.error('Error al agendar la cita', 'Error');
        console.error(error);
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']).then(() => {
      window.location.reload();
    });
  }

  // Getters
  get pacienteId() { return this.citaForm.get('pacienteId'); }
  get odontologoId() { return this.citaForm.get('odontologoId'); }
  get tratamientoId() { return this.citaForm.get('tratamientoId'); }
  get fecha() { return this.citaForm.get('fecha'); }
  get hora() { return this.citaForm.get('hora'); }
}