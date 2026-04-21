import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Estrategia que nunca reutiliza rutas.
 * Fuerza la recreación del componente cada vez que se navega,
 * resolviendo el problema de @ViewChild undefined al volver de formularios.
 */
export class NoReuseStrategy implements RouteReuseStrategy {
  shouldDetach(_route: ActivatedRouteSnapshot): boolean { return false; }
  store(_route: ActivatedRouteSnapshot, _handle: DetachedRouteHandle | null): void {}
  shouldAttach(_route: ActivatedRouteSnapshot): boolean { return false; }
  retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null { return null; }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Reutilizar solo si es exactamente la misma ruta Y mismos parámetros
    return future.routeConfig === curr.routeConfig &&
           JSON.stringify(future.params) === JSON.stringify(curr.params);
  }
}