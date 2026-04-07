import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { EmpleadosService } from '../../../core/services/empleados.service';
import { RolesService } from '../../../core/services/roles.service';
import { ToastService } from '../../../core/services/toast.service';
import { Rol, UsuarioResumen } from '../../../core/models/rol.model';
import {
  EmpleadoApi,
  EmpleadoCreateDto,
  EmpleadoUpdateDto
} from '../../../core/models/empleado-api.model';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.scss'
})
export class EmpleadoFormComponent implements OnInit {
  loading = false;
  isEditMode = false;
  empleadoId?: number;

  roles: Rol[] = [];
  usuarios: UsuarioResumen[] = [];

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private empleadosService: EmpleadosService,
    private rolesService: RolesService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      usuarioId: [null as number | null],
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellidos: ['', [Validators.required, Validators.maxLength(120)]],
      cedula: ['', [Validators.required, Validators.maxLength(20)]],
      rolId: [null as number | null, Validators.required],
      especialidad: [''],
      codigoProfesional: [''],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      direccion: [''],
      fechaIngreso: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.detectarModoEdicion();
    this.configurarValidacionesPorRol();
  }

  cargarCatalogos(): void {
    forkJoin({
      roles: this.rolesService.getRoles(),
      usuarios: this.rolesService.getUsuarios()
    }).subscribe({
      next: ({ roles, usuarios }: { roles: Rol[]; usuarios: UsuarioResumen[] }) => {
        this.roles = roles.filter((r: Rol) => r.activo);
        this.usuarios = usuarios.filter((u: UsuarioResumen) => u.activo);
      },
      error: (error: any) => {
        this.toast.httpError(error, 'No fue posible cargar roles y usuarios');
      }
    });
  }

  detectarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.isEditMode = true;
    this.empleadoId = Number(id);
    this.cargarEmpleado();
  }

  cargarEmpleado(): void {
    if (!this.empleadoId) return;

    this.loading = true;

    this.empleadosService.getEmpleadoById(this.empleadoId).subscribe({
      next: (empleado: EmpleadoApi) => {
        this.form.patchValue({
          usuarioId: empleado.usuarioId ?? null,
          codigo: empleado.codigo,
          nombre: empleado.nombre,
          apellidos: empleado.apellidos,
          cedula: empleado.cedula,
          rolId: empleado.rolId,
          especialidad: empleado.especialidad ?? '',
          codigoProfesional: empleado.codigoProfesional ?? '',
          telefono: empleado.telefono,
          email: empleado.email,
          direccion: empleado.direccion ?? '',
          fechaIngreso: empleado.fechaIngreso?.substring(0, 10)
        });

        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.toast.httpError(error, 'No fue posible cargar el empleado');
        this.router.navigate(['/empleados']);
      }
    });
  }

  configurarValidacionesPorRol(): void {
    this.form.get('rolId')?.valueChanges.subscribe((rolId: number | null) => {
      const rolSeleccionado = this.roles.find((r: Rol) => r.id === rolId);
      const nombreRol = (rolSeleccionado?.nombre || '').toLowerCase();

      const especialidadCtrl = this.form.get('especialidad');
      const codigoProfesionalCtrl = this.form.get('codigoProfesional');

      if (nombreRol.includes('odont')) {
        especialidadCtrl?.setValidators([Validators.required]);
        codigoProfesionalCtrl?.setValidators([Validators.required]);
      } else {
        especialidadCtrl?.clearValidators();
        codigoProfesionalCtrl?.clearValidators();
      }

      especialidadCtrl?.updateValueAndValidity();
      codigoProfesionalCtrl?.updateValueAndValidity();
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Completa los campos requeridos antes de continuar');
      return;
    }

    this.loading = true;

    const payload: EmpleadoCreateDto = {
      usuarioId: this.form.value.usuarioId ?? null,
      codigo: this.form.value.codigo ?? '',
      nombre: this.form.value.nombre ?? '',
      apellidos: this.form.value.apellidos ?? '',
      cedula: this.form.value.cedula ?? '',
      rolId: this.form.value.rolId ?? 0,
      especialidad: this.form.value.especialidad || null,
      codigoProfesional: this.form.value.codigoProfesional || null,
      telefono: this.form.value.telefono ?? '',
      email: this.form.value.email ?? '',
      direccion: this.form.value.direccion || null,
      fechaIngreso: this.form.value.fechaIngreso ?? ''
    };

    const request = this.isEditMode && this.empleadoId
      ? this.empleadosService.actualizarEmpleado(this.empleadoId, payload as EmpleadoUpdateDto)
      : this.empleadosService.crearEmpleado(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(
          this.isEditMode
            ? 'Empleado actualizado correctamente'
            : 'Empleado creado correctamente'
        );
        this.router.navigate(['/empleados']);
      },
      error: (error: any) => {
        this.loading = false;
        this.toast.httpError(error, 'No fue posible guardar el empleado');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/empleados']);
  }

  get f(): any {
  return this.form.controls;
}
}