import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'pacientes',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'pacientes/nuevo',
        loadComponent: () => import('./features/pacientes/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent)
      },
      {
        path: 'pacientes/editar/:id',
        loadComponent: () => import('./features/pacientes/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent)
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./features/pacientes/paciente-detalle/paciente-detalle.component').then(m => m.PacienteDetalleComponent)
      },
      {
        path: 'citas',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent)
      },
      {
        path: 'citas/nueva',
        loadComponent: () => import('./features/citas/cita-form/cita-form.component').then(m => m.CitaFormComponent)
      },
      {
        path: 'citas/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/citas/cita-detalle/cita-detalle.component').then(m => m.CitaDetalleComponent)
      },
      {
        path: 'tratamientos',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/tratamientos/tratamientos.component').then(m => m.TratamientosComponent)
      },
      {
        path: 'tratamientos/nuevo',
        loadComponent: () => import('./features/tratamientos/tratamiento-form/tratamiento-form.component').then(m => m.TratamientoFormComponent)
      },
      {
        path: 'tratamientos/editar/:id',
        loadComponent: () => import('./features/tratamientos/tratamiento-form/tratamiento-form.component').then(m => m.TratamientoFormComponent)
      },
      {
        path: 'empleados',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/empleados/empleados.component').then(m => m.EmpleadosComponent)
      },
      {
        path: 'empleados/nuevo',
        loadComponent: () => import('./features/empleados/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'empleados/editar/:id',
        loadComponent: () => import('./features/empleados/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'inventario',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'inventario/nuevo',
        loadComponent: () => import('./features/inventario/inventario-form/inventario-form.component').then(m => m.InventarioFormComponent)
      },
      {
        path: 'inventario/editar/:id',
        loadComponent: () => import('./features/inventario/inventario-form/inventario-form.component').then(m => m.InventarioFormComponent)
      },
      {
        path: 'roles',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [authGuard]
      },

      {
        path: 'horarios',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/horarios/horarios.component').then(m => m.HorariosComponent)
      },

      {
        path: 'facturacion',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/facturacion/facturacion.component').then(m => m.FacturacionComponent)
      },

      {
        path: 'reportes',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent)
      },

      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil-config-ayuda.component').then(m => m.PerfilComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/perfil/perfil-config-ayuda.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'ayuda',
        loadComponent: () => import('./features/perfil/perfil-config-ayuda.component').then(m => m.AyudaComponent)
      },
      {
        path: 'roles-permisos',
        loadComponent: () => import('./features/roles-permisos/roles-permisos.component').then(m => m.RolesPermisosComponent),
        canActivate: [authGuard]
      }

    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];