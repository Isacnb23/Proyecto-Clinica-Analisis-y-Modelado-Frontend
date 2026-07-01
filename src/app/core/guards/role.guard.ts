import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../services/roles.service';

// Mapa de ruta → permiso requerido
const ROUTE_PERMISSIONS: Record<string, string> = {
  'dashboard':    'dashboard.ver',
  'pacientes':    'pacientes.ver',
  'citas':        'citas.ver',
  'horarios':     'horarios.ver',
  'tratamientos': 'tratamientos.ver',
  'empleados':    'empleados.ver',
  'inventario':   'inventario.ver',
  'facturacion':  'facturacion.ver',
  'roles':        'roles.ver',
  'reportes':     'reportes.ver',

  // Sub-rutas de formularios (permiso distinto al de la vista de listado)
  'pacientes/nuevo':          'pacientes.crear',
  'pacientes/editar/:id':     'pacientes.editar',
  'citas/nueva':              'citas.crear',
  'tratamientos/nuevo':       'tratamientos.crear',
  'empleados/nuevo':          'empleados.crear',
  'inventario/nuevo':         'inventario.editar',
};

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const auth    = inject(AuthService);
  const roles   = inject(RolesService);
  const router  = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = auth.currentUserValue;
  if (!user) { router.navigate(['/login']); return false; }

  // Admin siempre tiene acceso total
  if (user.rol?.toLowerCase() === 'admin') return true;

  const fullPath = route.routeConfig?.path || '';
  const routePath = fullPath.split('/')[0] || '';
  // Prioriza el permiso de la sub-ruta exacta (ej. 'pacientes/nuevo') sobre el de la ruta base
  const requiredPermission = ROUTE_PERMISSIONS[fullPath] ?? ROUTE_PERMISSIONS[routePath];

  // Si la ruta no tiene permiso configurado, permitir
  if (!requiredPermission) return true;

  const userPermissions = roles.getRolePermissions(user.rol);
  if (userPermissions.includes(requiredPermission)) return true;

  // Sin permiso → redirigir al dashboard con mensaje
  router.navigate(['/dashboard']);
  return false;
};