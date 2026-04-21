import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioCreate } from '../../core/services/usuario.service';
import { RolesService } from '../../core/services/roles.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="usuarios-container">
      <div class="header">
        <h1>👤 Gestión de Usuarios</h1>
        <button class="btn-primary" (click)="abrirFormulario()">+ Nuevo Usuario</button>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-msg">Cargando usuarios...</div>

      <!-- Tabla de usuarios -->
      <div class="usuarios-tabla" *ngIf="!cargando">
        <div *ngIf="usuarios.length === 0" class="empty-msg">
          No hay usuarios registrados aún.
        </div>
        <table *ngIf="usuarios.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let usuario of usuarios">
              <td>{{ usuario.id }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <span class="badge badge-rol">{{ usuario.rol || usuario.rolNombre || 'Sin rol' }}</span>
              </td>
              <td>
                <span [class]="usuario.activo ? 'badge badge-activo' : 'badge badge-inactivo'">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button class="btn-sm btn-success" *ngIf="!usuario.activo" (click)="activarUsuario(usuario.id)">Activar</button>
                <button class="btn-sm btn-danger" *ngIf="usuario.activo" (click)="desactivarUsuario(usuario.id)">Desactivar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de formulario -->
      <div class="modal" *ngIf="mostrarFormulario" (click)="cerrarFormulario()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nuevo Usuario</h2>
            <button class="btn-close" (click)="cerrarFormulario()">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Email *</label>
              <input
                type="email"
                [(ngModel)]="formulario.email"
                placeholder="usuario@clinica.com"
                required
              >
            </div>

            <div class="form-group">
              <label>Contraseña * <small>(mínimo 6 caracteres)</small></label>
              <input
                type="password"
                [(ngModel)]="formulario.password"
                placeholder="••••••••"
                required
              >
            </div>

            <!-- ✅ Campo confirmPassword requerido por el backend -->
            <div class="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                [(ngModel)]="formulario.confirmPassword"
                placeholder="••••••••"
                required
              >
              <small class="error-msg" *ngIf="formulario.password && formulario.confirmPassword && formulario.password !== formulario.confirmPassword">
                Las contraseñas no coinciden
              </small>
            </div>

            <div class="form-group">
              <label>Rol *</label>
              <select [(ngModel)]="formulario.rolId" required>
                <option [ngValue]="0">Seleccione un rol</option>
                <option *ngFor="let rol of roles" [ngValue]="rol.id">{{ rol.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="cerrarFormulario()">Cancelar</button>
            <button class="btn-primary" (click)="guardarUsuario()" [disabled]="guardando">
              {{ guardando ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usuarios-container { padding: 2rem; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 { margin: 0; color: #1a365d; }

    .loading-msg, .empty-msg {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
      font-size: 1.1rem;
    }

    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-collapse: collapse;
    }

    th {
      background: #1a365d;
      color: white;
      padding: 1rem;
      text-align: left;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .badge-activo  { background: #d1fae5; color: #065f46; }
    .badge-inactivo { background: #fee2e2; color: #991b1b; }
    .badge-rol     { background: #dbeafe; color: #1e40af; }

    .btn-primary {
      background: #1a365d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover { background: #2c5282; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }

    .btn-sm {
      padding: 0.4rem 0.9rem;
      margin-right: 0.4rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-danger  { color: #dc2626; border-color: #dc2626; }
    .btn-success { color: #059669; border-color: #059669; }

    .modal {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 480px;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 { margin: 0; color: #1a365d; }

    .btn-close { background: none; border: none; font-size: 2rem; cursor: pointer; color: #666; }

    .modal-body { padding: 1.5rem; }

    .form-group { margin-bottom: 1.25rem; }

    .form-group label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.7rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .error-msg { color: #dc2626; font-size: 0.8rem; margin-top: 0.25rem; display: block; }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: any[] = [];
  mostrarFormulario = false;
  cargando = false;
  guardando = false;

  formulario: UsuarioCreate = {
    email: '',
    password: '',
    confirmPassword: '',
    rolId: 0
  };

  constructor(
    private usuarioService: UsuarioService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar usuarios. Verifica que el backend esté en línea.');
        this.cargando = false;
      }
    });
  }

  cargarRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => { this.roles = roles; },
      error: (error) => { console.error('Error al cargar roles:', error); }
    });
  }

  abrirFormulario(): void {
    this.formulario = { email: '', password: '', confirmPassword: '', rolId: 0 };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardarUsuario(): void {
    // Validaciones
    if (!this.formulario.email || !this.formulario.password || !this.formulario.rolId) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    if (this.formulario.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.formulario.password !== this.formulario.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if (!this.formulario.rolId || this.formulario.rolId === 0) {
      alert('Debe seleccionar un rol.');
      return;
    }

    this.guardando = true;

    this.usuarioService.crearUsuario(this.formulario).subscribe({
      next: () => {
        alert('Usuario creado correctamente.');
        this.cerrarFormulario();
        this.cargarUsuarios();
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        const msg = error?.error?.message || error?.error?.errors
          ? JSON.stringify(error.error.errors)
          : 'Error desconocido';
        alert('Error al crear usuario: ' + msg);
        this.guardando = false;
      }
    });
  }

  activarUsuario(id: number): void {
    if (!confirm('¿Activar este usuario?')) return;
    this.usuarioService.activarUsuario(id).subscribe({
      next: () => { alert('Usuario activado.'); this.cargarUsuarios(); },
      error: (err) => { alert('Error al activar usuario.'); console.error(err); }
    });
  }

  desactivarUsuario(id: number): void {
    if (!confirm('¿Desactivar este usuario?')) return;
    // ✅ Usa el endpoint PATCH /desactivar que creamos en el backend
    this.usuarioService.desactivarUsuario(id).subscribe({
      next: () => { alert('Usuario desactivado.'); this.cargarUsuarios(); },
      error: (err) => { alert('Error al desactivar usuario.'); console.error(err); }
    });
  }
}