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
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-empleado-form',
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
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.scss'
})
export class EmpleadoFormComponent implements OnInit {
  datosPersonalesForm!: FormGroup;
  datosContactoForm!: FormGroup;
  datosLaboralesForm!: FormGroup;
  
  isEditMode = false;
  empleadoId?: number;
  loading = false;

  roles = ['Administrador', 'Odontólogo', 'Asistente', 'Recepcionista'];
  generos = ['Masculino', 'Femenino', 'Otro'];
  
  especialidades = [
    'Odontología General',
    'Ortodoncia',
    'Endodoncia',
    'Periodoncia',
    'Cirugía Oral',
    'Implantología',
    'Estética Dental',
    'Odontopediatría'
  ];

  maxDateNacimiento = new Date();

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    // Establecer fecha máxima (18 años atrás)
    this.maxDateNacimiento.setFullYear(this.maxDateNacimiento.getFullYear() - 18);
  }

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
    this.configurarValidacionesCondicionales();
  }

  initForms(): void {
    // Paso 1: Datos Personales
    this.datosPersonalesForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido1: ['', [Validators.required, Validators.minLength(2)]],
      apellido2: [''],
      cedula: ['', [Validators.required, Validators.pattern(/^\d-\d{4}-\d{4}$/)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required]
    });

    // Paso 2: Datos de Contacto
    this.datosContactoForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['']
    });

    // Paso 3: Datos Laborales
    this.datosLaboralesForm = this.fb.group({
      rol: ['', Validators.required],
      especialidad: [''],
      numeroLicencia: [''],
      fechaContratacion: ['', Validators.required],
      salario: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  configurarValidacionesCondicionales(): void {
    // Si el rol es Odontólogo, especialidad y licencia son requeridas
    this.datosLaboralesForm.get('rol')?.valueChanges.subscribe(rol => {
      const especialidadControl = this.datosLaboralesForm.get('especialidad');
      const licenciaControl = this.datosLaboralesForm.get('numeroLicencia');

      if (rol === 'Odontólogo') {
        especialidadControl?.setValidators([Validators.required]);
        licenciaControl?.setValidators([Validators.required, Validators.minLength(5)]);
      } else {
        especialidadControl?.clearValidators();
        licenciaControl?.clearValidators();
      }

      especialidadControl?.updateValueAndValidity();
      licenciaControl?.updateValueAndValidity();
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.empleadoId = Number(id);
      this.cargarEmpleado();
    }
  }

  cargarEmpleado(): void {
    if (!this.empleadoId) return;

    this.empleadoService.getEmpleadoById(this.empleadoId).subscribe({
      next: (empleado) => {
        if (empleado) {
          // Cargar datos personales
          this.datosPersonalesForm.patchValue({
            codigo: empleado.codigo,
            nombre: empleado.nombre,
            apellido1: empleado.apellido1,
            apellido2: empleado.apellido2,
            cedula: empleado.cedula,
            fechaNacimiento: empleado.fechaNacimiento,
            genero: empleado.genero
          });

          // Cargar datos de contacto
          this.datosContactoForm.patchValue({
            telefono: empleado.telefono,
            email: empleado.email,
            direccion: empleado.direccion
          });

          // Cargar datos laborales
          this.datosLaboralesForm.patchValue({
            rol: empleado.rol,
            especialidad: empleado.especialidad,
            numeroLicencia: empleado.numeroLicencia,
            fechaContratacion: empleado.fechaContratacion,
            salario: empleado.salario,
            observaciones: empleado.observaciones
          });
        } else {
          this.toastr.error('Empleado no encontrado', 'Error');
          this.router.navigate(['/empleados']);
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el empleado', 'Error');
        console.error(error);
        this.router.navigate(['/empleados']);
      }
    });
  }

  onSubmit(): void {
    // Validar todos los formularios
    if (this.datosPersonalesForm.invalid || 
        this.datosContactoForm.invalid || 
        this.datosLaboralesForm.invalid) {
      this.datosPersonalesForm.markAllAsTouched();
      this.datosContactoForm.markAllAsTouched();
      this.datosLaboralesForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;

    // Combinar todos los formularios
    const formData = {
      ...this.datosPersonalesForm.value,
      ...this.datosContactoForm.value,
      ...this.datosLaboralesForm.value
    };

    if (this.isEditMode && this.empleadoId) {
      // Actualizar
      this.empleadoService.actualizarEmpleado(this.empleadoId, formData).subscribe({
        next: () => {
          this.toastr.success('Empleado actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/empleados']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el empleado', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.empleadoService.crearEmpleado(formData).subscribe({
        next: () => {
          this.toastr.success('Empleado creado correctamente', '¡Éxito!');
          this.router.navigate(['/empleados']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al crear el empleado', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/empleados']).then(() => {
      window.location.reload();
    });
  }

  // Getters para validaciones - Paso 1
  get codigo() { return this.datosPersonalesForm.get('codigo'); }
  get nombre() { return this.datosPersonalesForm.get('nombre'); }
  get apellido1() { return this.datosPersonalesForm.get('apellido1'); }
  get cedula() { return this.datosPersonalesForm.get('cedula'); }
  get fechaNacimiento() { return this.datosPersonalesForm.get('fechaNacimiento'); }
  get genero() { return this.datosPersonalesForm.get('genero'); }

  // Getters para validaciones - Paso 2
  get telefono() { return this.datosContactoForm.get('telefono'); }
  get email() { return this.datosContactoForm.get('email'); }

  // Getters para validaciones - Paso 3
  get rol() { return this.datosLaboralesForm.get('rol'); }
  get especialidad() { return this.datosLaboralesForm.get('especialidad'); }
  get numeroLicencia() { return this.datosLaboralesForm.get('numeroLicencia'); }
  get fechaContratacion() { return this.datosLaboralesForm.get('fechaContratacion'); }
  get salario() { return this.datosLaboralesForm.get('salario'); }
}