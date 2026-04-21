import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../services/roles.service';

// Mapa de ruta → permiso requerido
const ROUTE_PERMISSIONS: Record<string, string> = {
  'dashboard':    'dashboard.ver',
  'pacientes':    'pacientes.ver',
  'citas':        'citas.ver',
  'horarios':     'empleados.ver', // Solo admin y quienes vean empleados
  'tratamientos': 'tratamientos.ver',
  'empleados':    'empleados.ver',
  'inventario':   'inventario.ver',
  'facturacion':  'facturacion.ver',
  'roles':        'roles.ver',
  'reportes':     'reportes.ver',
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

  const routePath = route.routeConfig?.path?.split('/')[0] || '';
  const requiredPermission = ROUTE_PERMISSIONS[routePath];

  // Si la ruta no tiene permiso configurado, permitir
  if (!requiredPermission) return true;

  const userPermissions = roles.getRolePermissions(user.rol);
  if (userPermissions.includes(requiredPermission)) return true;

  // Sin permiso → redirigir al dashboard con mensaje
  router.navigate(['/dashboard']);
  return false;
};