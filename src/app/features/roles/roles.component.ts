import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RolesService } from '../../core/services/roles.service';
import { ToastService } from '../../core/services/toast.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Rol, UsuarioResumen } from '../../core/models/rol.model';

interface PermisoGrupo { grupo: string; icon: string; permisos: string[]; }

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatTooltipModule, MatDividerModule,
    MatChipsModule, MatFormFieldModule, MatInputModule
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

  permisosGrupos: PermisoGrupo[] = [
    { grupo: 'Dashboard',    icon: 'dashboard',            permisos: ['dashboard.ver'] },
    { grupo: 'Pacientes',    icon: 'people',               permisos: ['pacientes.ver', 'pacientes.crear', 'pacientes.editar'] },
    { grupo: 'Citas',        icon: 'event',                permisos: ['citas.ver', 'citas.crear', 'citas.cancelar'] },
    { grupo: 'Tratamientos', icon: 'medical_services',     permisos: ['tratamientos.ver', 'tratamientos.crear'] },
    { grupo: 'Empleados',    icon: 'badge',                permisos: ['empleados.ver', 'empleados.crear', 'empleados.editar'] },
    { grupo: 'Inventario',   icon: 'inventory_2',          permisos: ['inventario.ver', 'inventario.editar'] },
    { grupo: 'Facturación',  icon: 'receipt_long',         permisos: ['facturacion.ver', 'facturacion.pagar'] },
    { grupo: 'Roles',        icon: 'admin_panel_settings', permisos: ['roles.ver', 'roles.asignar'] },
    { grupo: 'Reportes',     icon: 'assessment',           permisos: ['reportes.ver'] },
  ];

  mostrarModalUsuario = false;
  nuevoUsuario = { email: '', password: '', confirmPassword: '', rolId: 0 };
  creandoUsuario = false;

  constructor(
    private rolesService: RolesService,
    private usuarioService: UsuarioService,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        if (!this.selectedRoleNameForPermissions && data.length) {
          this.selectedRoleNameForPermissions = data[0].nombre;
        }
      },
      error: (e) => this.toast.httpError(e, 'Error al cargar roles')
    });
    this.rolesService.getUsuarios().subscribe({
      next: (data) => { this.usuarios = data; },
      error: (e) => this.toast.httpError(e, 'Error al cargar usuarios')
    });
  }

  asignarRol(): void {
    if (!this.selectedUsuarioId || !this.selectedRolId) { this.toast.warning('Selecciona usuario y rol'); return; }
    this.rolesService.assignRole({ usuarioId: this.selectedUsuarioId, rolId: this.selectedRolId }).subscribe({
      next: () => { this.toast.success('Rol asignado'); this.cargarDatos(); },
      error: (e) => this.toast.httpError(e, 'Error al asignar rol')
    });
  }

  revocarRol(usuarioId: number): void {
    if (!confirm('¿Revocar el rol de este usuario?')) return;
    this.rolesService.revokeRole(usuarioId).subscribe({
      next: () => { this.toast.success('Rol revocado'); this.cargarDatos(); },
      error: (e) => this.toast.httpError(e, 'Error al revocar')
    });
  }

  cambiarEstadoRol(rol: Rol): void {
    const req = rol.activo ? this.rolesService.deactivateRole(rol.id) : this.rolesService.activateRole(rol.id);
    req.subscribe({
      next: () => { this.toast.success(`Rol ${rol.activo ? 'desactivado' : 'activado'}`); this.cargarDatos(); },
      error: (e) => this.toast.httpError(e, 'Error')
    });
  }

  hasPermission(p: string): boolean {
    return this.rolesService.getRolePermissions(this.selectedRoleNameForPermissions).includes(p);
  }

  togglePermission(p: string, checked: boolean): void {
    const current = this.rolesService.getRolePermissions(this.selectedRoleNameForPermissions);
    const updated = checked ? [...new Set([...current, p])] : current.filter(x => x !== p);
    this.rolesService.saveRolePermissions(this.selectedRoleNameForPermissions, updated);
  }

  guardarPermisos(): void {
    window.dispatchEvent(new Event('storage'));
    this.toast.success('Permisos guardados. Menú actualizado.');
  }

  countPermisos(roleName: string): number {
    return this.rolesService.getRolePermissions(roleName).length;
  }

  formatPermiso(p: string): string {
    const [, acc] = p.split('.');
    return ({ ver:'Ver', crear:'Crear', editar:'Editar', cancelar:'Cancelar', pagar:'Pagar', asignar:'Asignar' })[acc] || acc;
  }

  abrirModalUsuario(): void { this.nuevoUsuario = { email:'', password:'', confirmPassword:'', rolId:0 }; this.mostrarModalUsuario = true; }
  cerrarModalUsuario(): void { this.mostrarModalUsuario = false; this.creandoUsuario = false; }

  crearUsuario(): void {
    if (!this.nuevoUsuario.email || !this.nuevoUsuario.password) { this.toast.warning('Email y contraseña requeridos'); return; }
    if (this.nuevoUsuario.password !== this.nuevoUsuario.confirmPassword) { this.toast.warning('Las contraseñas no coinciden'); return; }
    if (!this.nuevoUsuario.rolId) { this.toast.warning('Selecciona un rol'); return; }
    this.creandoUsuario = true;
    this.usuarioService.crearUsuario({ ...this.nuevoUsuario }).subscribe({
      next: () => { this.toast.success('Usuario creado'); this.cerrarModalUsuario(); this.cargarDatos(); },
      error: (e: any) => { this.toast.httpError(e, 'Error al crear usuario'); this.creandoUsuario = false; }
    });
  }
}