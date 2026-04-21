import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoInventario, MovimientoInventario, CategoriaInventario, Proveedor, EstadisticasInventario } from '../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/Inventario`;
  constructor(private http: HttpClient) {}

  getProductos(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos`);
  }
  getProductoById(id: number): Observable<ProductoInventario> {
    return this.http.get<ProductoInventario>(`${this.apiUrl}/productos/${id}`);
  }
  crearProducto(data: any): Observable<ProductoInventario> {
    return this.http.post<ProductoInventario>(`${this.apiUrl}/productos`, data);
  }
  actualizarProducto(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos`, payload);
  }
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }
  activarProducto(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/productos/${id}/activar`, {});
  }
  getMovimientos(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/movimientos`);
  }
  crearMovimiento(data: any): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, data);
  }
  getCategorias(): Observable<CategoriaInventario[]> {
    return this.http.get<CategoriaInventario[]>(`${this.apiUrl}/categorias`);
  }
  crearCategoria(data: any): Observable<CategoriaInventario> {
    return this.http.post<CategoriaInventario>(`${this.apiUrl}/categorias`, data);
  }
  getProductosByCategoria(categoriaId: number): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos?categoriaId=${categoriaId}`);
  }
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`);
  }
  getProductosBajoStock(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(`${this.apiUrl}/productos?stockBajo=true`);
  }
  getProductosStockBajo(): Observable<ProductoInventario[]> {
    return this.getProductosBajoStock();
  }
  getEstadisticas(): Observable<EstadisticasInventario> {
    return this.http.get<EstadisticasInventario>(`${this.apiUrl}/estadisticas`);
  }
}