import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Permiso {
  modulo: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permiso[];
}

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="roles-container">
      <h1>🔐 Roles y Permisos</h1>

      <div class="roles-grid">
        <div class="roles-list">
          <h2>Roles del Sistema</h2>
          <div class="rol-card" 
               *ngFor="let rol of roles" 
               [class.selected]="rolSeleccionado?.id === rol.id"
               (click)="seleccionarRol(rol)">
            <h3>{{ rol.nombre }}</h3>
            <p>{{ rol.descripcion }}</p>
          </div>
        </div>

        <div class="permisos-panel" *ngIf="rolSeleccionado">
          <h2>Permisos de {{ rolSeleccionado.nombre }}</h2>
          
          <table>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Ver</th>
                <th>Crear</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let permiso of rolSeleccionado.permisos">
                <td><strong>{{ permiso.modulo }}</strong></td>
                <td>
                  <input type="checkbox" [(ngModel)]="permiso.ver" (change)="onPermisoChange()">
                </td>
                <td>
                  <input type="checkbox" [(ngModel)]="permiso.crear" (change)="onPermisoChange()">
                </td>
                <td>
                  <input type="checkbox" [(ngModel)]="permiso.editar" (change)="onPermisoChange()">
                </td>
                <td>
                  <input type="checkbox" [(ngModel)]="permiso.eliminar" (change)="onPermisoChange()">
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions">
            <button class="btn-save" (click)="guardarPermisos()">💾 Guardar Cambios</button>
            <button class="btn-cancel" (click)="cancelar()">❌ Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
      color: #1a365d;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    .roles-list h2 {
      margin-bottom: 1rem;
      color: #1a365d;
    }

    .rol-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .rol-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    .rol-card.selected {
      border-color: #1a365d;
      background: #eff6ff;
    }

    .rol-card h3 {
      margin: 0 0 0.5rem 0;
      color: #1a365d;
    }

    .rol-card p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .permisos-panel {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .permisos-panel h2 {
      margin: 0 0 1.5rem 0;
      color: #1a365d;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    th {
      background: #1a365d;
      color: white;
      padding: 1rem;
      text-align: left;
      font-weight: 500;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: center;
    }

    td:first-child {
      text-align: left;
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-save {
      background: #059669;
      color: white;
    }

    .btn-cancel {
      background: #6b7280;
      color: white;
    }

    button:hover {
      opacity: 0.9;
    }
  `]
})
export class RolesPermisosComponent implements OnInit {
  roles: Rol[] = [];
  rolSeleccionado: Rol | null = null;
  cambiosPendientes: boolean = false;

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    // Mock data - reemplazar con llamada al servicio
    this.roles = [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Acceso completo al sistema',
        permisos: this.getPermisosCompletos()
      },
      {
        id: 2,
        nombre: 'Odontólogo',
        descripcion: 'Gestión de pacientes y tratamientos',
        permisos: this.getPermisosOdontologo()
      },
      {
        id: 3,
        nombre: 'Recepcionista',
        descripcion: 'Gestión de citas y pacientes',
        permisos: this.getPermisosRecepcionista()
      }
    ];
  }

  getPermisosCompletos(): Permiso[] {
    const modulos = ['Dashboard', 'Pacientes', 'Citas', 'Empleados', 'Tratamientos', 
                     'Inventario', 'Facturación', 'Horarios', 'Reportes', 'Roles'];
    return modulos.map(m => ({
      modulo: m,
      ver: true,
      crear: true,
      editar: true,
      eliminar: true
    }));
  }

  getPermisosOdontologo(): Permiso[] {
    return [
      { modulo: 'Dashboard', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Pacientes', ver: true, crear: true, editar: true, eliminar: false },
      { modulo: 'Citas', ver: true, crear: true, editar: true, eliminar: false },
      { modulo: 'Empleados', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Tratamientos', ver: true, crear: true, editar: true, eliminar: false },
      { modulo: 'Inventario', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Facturación', ver: true, crear: true, editar: false, eliminar: false },
      { modulo: 'Horarios', ver: true, crear: false, editar: true, eliminar: false },
      { modulo: 'Reportes', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Roles', ver: false, crear: false, editar: false, eliminar: false }
    ];
  }

  getPermisosRecepcionista(): Permiso[] {
    return [
      { modulo: 'Dashboard', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Pacientes', ver: true, crear: true, editar: true, eliminar: false },
      { modulo: 'Citas', ver: true, crear: true, editar: true, eliminar: true },
      { modulo: 'Empleados', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Tratamientos', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Inventario', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Facturación', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Horarios', ver: true, crear: false, editar: false, eliminar: false },
      { modulo: 'Reportes', ver: false, crear: false, editar: false, eliminar: false },
      { modulo: 'Roles', ver: false, crear: false, editar: false, eliminar: false }
    ];
  }

  seleccionarRol(rol: Rol): void {
    if (this.cambiosPendientes) {
      if (confirm('Hay cambios sin guardar. ¿Desea continuar?')) {
        this.rolSeleccionado = rol;
        this.cambiosPendientes = false;
      }
    } else {
      this.rolSeleccionado = rol;
    }
  }

  onPermisoChange(): void {
    this.cambiosPendientes = true;
  }

  guardarPermisos(): void {
    // TODO: Llamar al servicio para guardar
    alert('Permisos guardados correctamente');
    this.cambiosPendientes = false;
  }

  cancelar(): void {
    if (confirm('¿Desea descartar los cambios?')) {
      this.cargarRoles();
      this.cambiosPendientes = false;
    }
  }
}
