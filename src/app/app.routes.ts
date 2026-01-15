import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Rutas públicas (sin layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // Rutas protegidas (con layout)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'pacientes',
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
        loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent)
      }, {
        path: 'citas',
        loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent)
      },
      {
        path: 'citas/nueva',
        loadComponent: () => import('./features/citas/cita-form/cita-form.component').then(m => m.CitaFormComponent)
      },
      // taratamientos
      {
        path: 'tratamientos',
        loadComponent: () => import('./features/tratamientos/tratamientos.component').then(m => m.TratamientosComponent)
      }, {
        path: 'tratamientos',
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
      // empleados
      {
        path: 'empleados',
        loadComponent: () => import('./features/empleados/empleados.component').then(m => m.EmpleadosComponent)
      }, {
        path: 'empleados',
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
      // Inventario
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'inventario',
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
      // Rutas futuras
      {
        path: 'empleados',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'tratamientos',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      }
    ]
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: '/login'
  }
];