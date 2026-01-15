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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { PacienteService } from '../../../core/services/paciente.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-paciente-form',
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
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.scss'
})
export class PacienteFormComponent implements OnInit {
  pacienteForm!: FormGroup;
  isEditMode = false;
  pacienteId?: number;
  loading = false;
  maxDate = new Date();

  generos = ['Masculino', 'Femenino', 'Otro'];
  estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'];

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.pacienteForm = this.fb.group({
      // Datos Personales
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido1: ['', [Validators.required, Validators.minLength(2)]],
      apellido2: [''],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{1}-\d{4}-\d{4}$/)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      telefonoSecundario: ['', Validators.pattern(/^\d{4}-\d{4}$/)],
      email: ['', Validators.email],
      direccion: [''],
      ocupacion: [''],
      estadoCivil: [''],

      // Responsable (si es menor)
      esmenor: [false],
      responsableNombre: [''],
      responsableParentesco: [''],
      responsableTelefono: ['', Validators.pattern(/^\d{4}-\d{4}$/)],
      responsableCedula: ['', Validators.pattern(/^\d{1}-\d{4}-\d{4}$/)],

      // Información Médica
      alergias: [''],
      enfermedades: [''],
      medicamentos: [''],
      observaciones: [''],
      referencia: ['']
    });

    // Validaciones condicionales para responsable
    this.pacienteForm.get('esmenor')?.valueChanges.subscribe(esmenor => {
      const responsableNombre = this.pacienteForm.get('responsableNombre');
      const responsableParentesco = this.pacienteForm.get('responsableParentesco');
      const responsableTelefono = this.pacienteForm.get('responsableTelefono');

      if (esmenor) {
        responsableNombre?.setValidators([Validators.required, Validators.minLength(2)]);
        responsableParentesco?.setValidators([Validators.required]);
        responsableTelefono?.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]);
      } else {
        responsableNombre?.clearValidators();
        responsableParentesco?.clearValidators();
        responsableTelefono?.clearValidators();
      }

      responsableNombre?.updateValueAndValidity();
      responsableParentesco?.updateValueAndValidity();
      responsableTelefono?.updateValueAndValidity();
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode = true;
      this.pacienteId = Number(id);
      this.cargarPaciente(this.pacienteId);
    }
  }

  cargarPaciente(id: number): void {
    this.loading = true;
    this.pacienteService.getPacienteById(id).subscribe({
      next: (paciente) => {
        if (paciente) {
          this.pacienteForm.patchValue({
            nombre: paciente.nombre,
            apellido1: paciente.apellido1,
            apellido2: paciente.apellido2,
            cedula: paciente.cedula,
            fechaNacimiento: paciente.fechaNacimiento,
            genero: paciente.genero,
            telefono: paciente.telefono,
            telefonoSecundario: paciente.telefonoSecundario,
            email: paciente.email,
            direccion: paciente.direccion,
            ocupacion: paciente.ocupacion,
            estadoCivil: paciente.estadoCivil,
            esmenor: !!paciente.responsable,
            responsableNombre: paciente.responsable?.nombre,
            responsableParentesco: paciente.responsable?.parentesco,
            responsableTelefono: paciente.responsable?.telefono,
            responsableCedula: paciente.responsable?.cedula,
            alergias: paciente.alergias,
            enfermedades: paciente.enfermedades,
            medicamentos: paciente.medicamentos,
            observaciones: paciente.observaciones,
            referencia: paciente.referencia
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar el paciente', 'Error');
        console.error(error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      this.toastr.error('Por favor complete todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;
    const formData = this.pacienteForm.value;

    if (this.isEditMode && this.pacienteId) {
      // Actualizar
      this.pacienteService.actualizarPaciente(this.pacienteId, formData).subscribe({
        next: () => {
          this.toastr.success('Paciente actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/pacientes']);
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el paciente', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.pacienteService.crearPaciente(formData).subscribe({
        next: () => {
          this.toastr.success('Paciente registrado correctamente', '¡Éxito!');
          this.router.navigate(['/pacientes']);
        },
        error: (error) => {
          this.toastr.error('Error al registrar el paciente', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
  this.router.navigate(['/pacientes']).then(() => {
    // Forzar recarga de la página
    window.location.reload();
  });
}

  // Getters para validación
  get nombre() { return this.pacienteForm.get('nombre'); }
  get apellido1() { return this.pacienteForm.get('apellido1'); }
  get cedula() { return this.pacienteForm.get('cedula'); }
  get fechaNacimiento() { return this.pacienteForm.get('fechaNacimiento'); }
  get genero() { return this.pacienteForm.get('genero'); }
  get telefono() { return this.pacienteForm.get('telefono'); }
  get email() { return this.pacienteForm.get('email'); }
  get esmenor() { return this.pacienteForm.get('esmenor'); }
  get responsableNombre() { return this.pacienteForm.get('responsableNombre'); }
  get responsableParentesco() { return this.pacienteForm.get('responsableParentesco'); }
  get responsableTelefono() { return this.pacienteForm.get('responsableTelefono'); }
}