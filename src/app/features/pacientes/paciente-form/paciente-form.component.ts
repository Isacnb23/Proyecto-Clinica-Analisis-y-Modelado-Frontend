import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
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

const NOMBRE_PATTERN = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s\-]{2,}$/;
const CEDULA_PATTERN = /^[1-9]-?\d{4}-?\d{4}$/;
const TELEFONO_PATTERN = /^[24678]\d{3}-?\d{4}$/;

function fechaNacimientoValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  const hoy = new Date();
  const hace120 = new Date();
  hace120.setFullYear(hoy.getFullYear() - 120);
  if (fecha > hoy) return { fechaFutura: true };
  if (fecha < hace120) return { fechaMuyAntigua: true };
  return null;
}

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
  esMayorDeEdad = false;

  generos = ['Masculino', 'Femenino', 'Otro'];
  estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'];
  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'];

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
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(NOMBRE_PATTERN)]],
      apellido1: ['', [Validators.required, Validators.minLength(2), Validators.pattern(NOMBRE_PATTERN)]],
      apellido2: ['', [Validators.pattern(NOMBRE_PATTERN)]],
      cedula: ['', [Validators.required, Validators.pattern(CEDULA_PATTERN)]],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValidator]],
      genero: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(TELEFONO_PATTERN)]],
      telefonoSecundario: ['', Validators.pattern(TELEFONO_PATTERN)],
      email: ['', Validators.email],
      direccion: [''],
      ocupacion: [''],
      estadoCivil: [''],
      tipoSangre: [''],

      // Responsable (si es menor)
      esmenor: [{ value: false, disabled: false }],
      responsableNombre: ['', [Validators.pattern(NOMBRE_PATTERN)]],
      responsableParentesco: [''],
      responsableTelefono: ['', Validators.pattern(TELEFONO_PATTERN)],
      responsableCedula: ['', Validators.pattern(CEDULA_PATTERN)],

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
        responsableNombre?.setValidators([Validators.required, Validators.minLength(2), Validators.pattern(NOMBRE_PATTERN)]);
        responsableParentesco?.setValidators([Validators.required]);
        responsableTelefono?.setValidators([Validators.required, Validators.pattern(TELEFONO_PATTERN)]);
      } else {
        responsableNombre?.clearValidators();
        responsableParentesco?.clearValidators();
        responsableTelefono?.clearValidators();
      }

      responsableNombre?.updateValueAndValidity();
      responsableParentesco?.updateValueAndValidity();
      responsableTelefono?.updateValueAndValidity();
    });

    // Edad calculada a partir de fecha de nacimiento: fuerza esmenor=false y bloquea el checkbox si es mayor de edad
    this.pacienteForm.get('fechaNacimiento')?.valueChanges.subscribe(fecha => {
      this.actualizarEsMayorDeEdad(fecha);
    });
  }

  calcularEdad(fechaNac: string | Date): number {
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mesDiff = hoy.getMonth() - nac.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  actualizarEsMayorDeEdad(fecha: string | Date | null): void {
    const esmenorControl = this.pacienteForm.get('esmenor');
    if (!fecha) {
      this.esMayorDeEdad = false;
      esmenorControl?.enable({ emitEvent: false });
      return;
    }

    const edad = this.calcularEdad(fecha);
    this.esMayorDeEdad = edad >= 18;

    if (this.esMayorDeEdad) {
      esmenorControl?.setValue(false, { emitEvent: true });
      esmenorControl?.disable({ emitEvent: false });
    } else {
      esmenorControl?.enable({ emitEvent: false });
    }
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
          // Separar apellidos
          const apellidos = paciente.apellidos?.split(' ') || [];
          const apellido1 = apellidos[0] || '';
          const apellido2 = apellidos.slice(1).join(' ') || '';

          // Mapeo de genero_id a texto
          const generoMap: { [key: number]: string } = {
            1: 'Masculino',
            2: 'Femenino',
            3: 'Otro'
          };

          this.pacienteForm.patchValue({
            nombre: paciente.nombre,
            apellido1: apellido1,
            apellido2: apellido2,
            cedula: paciente.cedula,
            fechaNacimiento: new Date(paciente.fecha_nacimiento),
            genero: generoMap[paciente.genero_id] || 'Otro',
            telefono: paciente.telefono,
            email: paciente.email || '',
            direccion: paciente.direccion || '',
            ocupacion: paciente.ocupacion || '',
            estadoCivil: paciente.estadoCivil || '',
            tipoSangre: paciente.tipo_sangre || '',
            responsableNombre: paciente.nombre_emergencia || '',
            responsableParentesco: paciente.relacion_emergencia || '',
            responsableTelefono: paciente.telefono_emergencia || '',
            alergias: paciente.alergias || '',
            enfermedades: paciente.enfermedades_cronicas || '',
            medicamentos: paciente.medicamentos || '',
            referencia: paciente.referencia || '',
            observaciones: paciente.observaciones || ''
          });

          // La edad calculada manda: si es mayor de edad, el checkbox queda bloqueado en false
          this.actualizarEsMayorDeEdad(paciente.fecha_nacimiento);
          if (!this.esMayorDeEdad) {
            this.pacienteForm.get('esmenor')?.setValue(!!paciente.esMenorDeEdad);
          }
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
    // getRawValue() incluye los controles disabled (ej. "esmenor" cuando es mayor de edad)
    const formData = this.pacienteForm.getRawValue();

    // Mapeo de géneros a IDs
    const generoMap: { [key: string]: number } = {
      'Masculino': 1,
      'Femenino': 2,
      'Otro': 3
    };

    // Combinar apellidos
    const apellidos = formData.apellido1 + (formData.apellido2 ? ' ' + formData.apellido2 : '');

    // Formato de fecha (YYYY-MM-DD)
    const fecha = new Date(formData.fechaNacimiento);
    const fechaNacimiento = fecha.toISOString().split('T')[0];

    const pacienteEnviar: any = {
      nombre: formData.nombre || '',
      apellidos: apellidos || '',
      cedula: formData.cedula || '',
      fecha_nacimiento: fechaNacimiento || '',
      genero_id: generoMap[formData.genero] || 3,
      telefono: formData.telefono || '',
      email: formData.email || '',
      direccion: formData.direccion || '',
      ocupacion: formData.ocupacion || '',
      estadoCivil: formData.estadoCivil || '',
      alergias: formData.alergias || '',
      enfermedades_cronicas: formData.enfermedades || '',
      medicamentos: formData.medicamentos || '',
      observaciones: formData.observaciones || '',
      referencia: formData.referencia || '',
      tipo_sangre: formData.tipoSangre || '',
      esMenorDeEdad: !!formData.esmenor,
      nombre_emergencia: formData.responsableNombre || '',
      telefono_emergencia: formData.responsableTelefono || '',
      relacion_emergencia: formData.responsableParentesco || ''
    };

    if (this.isEditMode && this.pacienteId) {
      this.pacienteService.actualizarPaciente({
        id: this.pacienteId,
        ...pacienteEnviar
      } as any).subscribe({
        next: () => {
          this.toastr.success('Paciente actualizado correctamente', '¡Éxito!');
          this.loading = false;
          this.router.navigate(['/pacientes']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el paciente', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      this.pacienteService.crearPaciente(pacienteEnviar as any).subscribe({
        next: () => {
          this.toastr.success('Paciente registrado correctamente', '¡Éxito!');
          this.loading = false;
          this.router.navigate(['/pacientes']).then(() => {
            window.location.reload();
          });
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
