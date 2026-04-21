import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ProductoInventario, 
  MovimientoInventario, 
  CategoriaInventario, 
  Proveedor,
  EstadisticasInventario
} from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/Inventario`;

  constructor(private http: HttpClient) {}

  // ===== PRODUCTOS =====
  getProductos(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos`);
  }

  getProductoById(id: number): Observable<ProductoInventario> {
    return this.http.get<ProductoInventario>(`${this.apiUrl}/productos/${id}`);
  }

  crearProducto(data: any): Observable<ProductoInventario> {
    return this.http.post<ProductoInventario>(`${this.apiUrl}/productos`, data);
  }

  // ✅ ACTUALIZAR con 2 parámetros (id, formData)
  actualizarProducto(id: number, data: any): Observable<ProductoInventario> {
    // ✅ El backend espera PUT /productos/{id} con el body sin ID
    return this.http.put<ProductoInventario>(`${this.apiUrl}/productos/${id}`, data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  activarProducto(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/productos/${id}/activar`, {});
  }

  // ===== MOVIMIENTOS =====
  getMovimientos(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/movimientos`);
  }

  registrarMovimiento(data: any): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, data);
  }

  // ===== CATEGORÍAS =====
  getCategorias(): Observable<CategoriaInventario[]> {
    return this.http.get<CategoriaInventario[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(nombre: string, descripcion?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categorias`, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    });
  }

  getProductosByCategoria(categoriaId: number): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos/categoria/${categoriaId}`);
  }

  // ===== PROVEEDORES =====
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`);
  }

  // ===== ALERTAS Y ESTADÍSTICAS =====
  getProductosBajoStock(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos/bajo-stock`);
  }

  // Alias para compatibilidad
  getProductosStockBajo(): Observable<ProductoInventario[]> {
    return this.getProductosBajoStock();
  }

  getEstadisticas(): Observable<EstadisticasInventario> {
    return this.http.get<EstadisticasInventario>(`${this.apiUrl}/estadisticas`);
  }
}