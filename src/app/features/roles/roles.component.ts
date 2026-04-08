import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RolesService } from '../../core/services/roles.service';
import { ToastService } from '../../core/services/toast.service';
import { Rol, UsuarioResumen } from '../../core/models/rol.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  usuarios: UsuarioResumen[] = [];

  selectedUsuarioId: number | null = null;
  selectedRolId: number | null = null;
  selectedRoleNameForPermissions = '';

  availablePermissions: string[] = [];

  constructor(
    private rolesService: RolesService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.availablePermissions = this.rolesService.getAvailablePermissions();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        if (!this.selectedRoleNameForPermissions && this.roles.length) {
          this.selectedRoleNameForPermissions = this.roles[0].nombre;
        }
      },
      error: (error) => {
        this.toast.httpError(error, 'No fue posible cargar los roles');
      }
    });

    this.rolesService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        this.toast.httpError(error, 'No fue posible cargar los usuarios');
      }
    });
  }

  asignarRol(): void {
    if (!this.selectedUsuarioId || !this.selectedRolId) {
      this.toast.warning('Selecciona un usuario y un rol antes de asignar');
      return;
    }

    this.rolesService.assignRole({
      usuarioId: this.selectedUsuarioId,
      rolId: this.selectedRolId
    }).subscribe({
      next: () => {
        this.toast.success('Rol asignado correctamente');
        this.cargarDatos();
      },
      error: (error) => {
        this.toast.httpError(error, 'No fue posible asignar el rol');
      }
    });
  }

  revocarRol(usuarioId: number): void {
    const confirmado = confirm('¿Deseas revocar el rol actual de este usuario?');

    if (!confirmado) return;

    this.rolesService.revokeRole(usuarioId).subscribe({
      next: () => {
        this.toast.success('Rol revocado correctamente');
        this.cargarDatos();
      },
      error: (error) => {
        this.toast.httpError(error, 'No fue posible revocar el rol');
      }
    });
  }

  cambiarEstadoRol(rol: Rol): void {
    const request = rol.activo
      ? this.rolesService.deactivateRole(rol.id)
      : this.rolesService.activateRole(rol.id);

    request.subscribe({
      next: () => {
        this.toast.success(`Rol ${rol.activo ? 'desactivado' : 'activado'} correctamente`);
        this.cargarDatos();
      },
      error: (error) => {
        this.toast.httpError(error, 'No fue posible actualizar el estado del rol');
      }
    });
  }

  hasPermission(permission: string): boolean {
    if (!this.selectedRoleNameForPermissions) return false;
    return this.rolesService.getRolePermissions(this.selectedRoleNameForPermissions).includes(permission);
  }

  togglePermission(permission: string, checked: boolean): void {
    if (!this.selectedRoleNameForPermissions) return;

    const current = this.rolesService.getRolePermissions(this.selectedRoleNameForPermissions);

    let updated: string[] = [];

    if (checked) {
      updated = [...new Set([...current, permission])];
    } else {
      updated = current.filter(item => item !== permission);
    }

    this.rolesService.saveRolePermissions(this.selectedRoleNameForPermissions, updated);
  }

  guardarPermisosDemo(): void {
    this.toast.info('Los permisos se guardaron localmente en el navegador para demo del sprint');
  }
}