import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  ProductoInventario, 
  ProductoFormData, 
  CategoriaInventario, 
  Proveedor,
  MovimientoInventario,
  EstadisticasInventario 
} from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productosSubject = new BehaviorSubject<ProductoInventario[]>(this.getProductosMock());
  public productos$ = this.productosSubject.asObservable();

  constructor() {}

  // Obtener todos los productos
  getProductos(): Observable<ProductoInventario[]> {
    return this.productos$.pipe(delay(500));
  }

  // Obtener producto por ID
  getProductoById(id: number): Observable<ProductoInventario | undefined> {
    return this.productos$.pipe(
      map(productos => productos.find(p => p.id === id))
    );
  }

  // Obtener productos por categoría
  getProductosByCategoria(categoriaId: number): Observable<ProductoInventario[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.categoriaId === categoriaId))
    );
  }

  // Obtener productos con stock bajo
  getProductosStockBajo(): Observable<ProductoInventario[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.stockActual <= p.stockMinimo && p.activo))
    );
  }

  // Buscar productos
  buscarProductos(termino: string): Observable<ProductoInventario[]> {
    return this.productos$.pipe(
      map(productos => 
        productos.filter(p => 
          p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          p.codigo.toLowerCase().includes(termino.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(termino.toLowerCase())
        )
      ),
      delay(300)
    );
  }

  // Crear producto
  crearProducto(data: ProductoFormData): Observable<ProductoInventario> {
    const productos = this.productosSubject.value;
    const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;

    const categoria = this.getCategoriaNombre(data.categoriaId);
    const proveedor = data.proveedorId ? this.getProveedorNombre(data.proveedorId) : undefined;

    const nuevoProducto: ProductoInventario = {
      id: nuevoId,
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoriaId: data.categoriaId,
      categoriaNombre: categoria,
      stockActual: data.stockActual,
      stockMinimo: data.stockMinimo,
      stockMaximo: data.stockMaximo,
      unidadMedida: data.unidadMedida,
      proveedorId: data.proveedorId,
      proveedorNombre: proveedor,
      costoUnitario: data.costoUnitario,
      precioVenta: data.precioVenta,
      ubicacion: data.ubicacion,
      activo: true,
      observaciones: data.observaciones,
      createdAt: new Date()
    };

    const nuevaLista = [...productos, nuevoProducto];
    this.productosSubject.next(nuevaLista);

    return of(nuevoProducto).pipe(delay(500));
  }

  // Actualizar producto
  actualizarProducto(id: number, data: ProductoFormData): Observable<ProductoInventario> {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
      const categoria = this.getCategoriaNombre(data.categoriaId);
      const proveedor = data.proveedorId ? this.getProveedorNombre(data.proveedorId) : undefined;

      const productoActualizado: ProductoInventario = {
        ...productos[index],
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId,
        categoriaNombre: categoria,
        stockActual: data.stockActual,
        stockMinimo: data.stockMinimo,
        stockMaximo: data.stockMaximo,
        unidadMedida: data.unidadMedida,
        proveedorId: data.proveedorId,
        proveedorNombre: proveedor,
        costoUnitario: data.costoUnitario,
        precioVenta: data.precioVenta,
        ubicacion: data.ubicacion,
        observaciones: data.observaciones,
        updatedAt: new Date()
      };

      const nuevaLista = [...productos];
      nuevaLista[index] = productoActualizado;
      this.productosSubject.next(nuevaLista);

      return of(productoActualizado).pipe(delay(500));
    }

    throw new Error('Producto no encontrado');
  }

  // Eliminar (desactivar) producto
  eliminarProducto(id: number): Observable<boolean> {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
      const nuevaLista = [...productos];
      nuevaLista[index] = { ...nuevaLista[index], activo: false };
      this.productosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Activar producto
  activarProducto(id: number): Observable<boolean> {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
      const nuevaLista = [...productos];
      nuevaLista[index] = { ...nuevaLista[index], activo: true };
      this.productosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Obtener categorías
  getCategorias(): Observable<CategoriaInventario[]> {
    return of([
      { id: 1, nombre: 'Instrumental', descripcion: 'Herramientas e instrumentos', color: '#667eea', icono: 'build', activo: true },
      { id: 2, nombre: 'Materiales Dentales', descripcion: 'Materiales de uso odontológico', color: '#4facfe', icono: 'healing', activo: true },
      { id: 3, nombre: 'Anestésicos', descripcion: 'Anestesia local y sedación', color: '#fa709a', icono: 'medication', activo: true },
      { id: 4, nombre: 'Higiene', descripcion: 'Productos de limpieza y desinfección', color: '#43e97b', icono: 'clean_hands', activo: true },
      { id: 5, nombre: 'Consumibles', descripcion: 'Guantes, mascarillas, etc', color: '#fee140', icono: 'inventory_2', activo: true },
      { id: 6, nombre: 'Farmacia', descripcion: 'Medicamentos y antibióticos', color: '#f093fb', icono: 'local_pharmacy', activo: true }
    ]).pipe(delay(300));
  }

  // Obtener proveedores
  getProveedores(): Observable<Proveedor[]> {
    return of([
      { id: 1, nombre: 'Dental Supply CR', contacto: 'María López', telefono: '2222-3333', email: 'ventas@dentalsupply.cr', activo: true },
      { id: 2, nombre: 'MediDental', contacto: 'Carlos Rojas', telefono: '2222-4444', email: 'info@medidental.com', activo: true },
      { id: 3, nombre: 'OdontoMax', contacto: 'Ana Vargas', telefono: '2222-5555', email: 'ventas@odontomax.cr', activo: true },
      { id: 4, nombre: 'Suministros Médicos SA', contacto: 'Roberto Mora', telefono: '2222-6666', email: 'contacto@summed.cr', activo: true }
    ]).pipe(delay(300));
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<EstadisticasInventario> {
    return this.productos$.pipe(
      map(productos => {
        const activos = productos.filter(p => p.activo);
        const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo && p.activo);
        const valorTotal = productos.reduce((sum, p) => sum + (p.stockActual * p.costoUnitario), 0);

        const alertas = stockBajo.map(p => ({
          productoId: p.id,
          productoNombre: p.nombre,
          stockActual: p.stockActual,
          stockMinimo: p.stockMinimo,
          urgencia: this.calcularUrgencia(p.stockActual, p.stockMinimo)
        }));

        return {
          totalProductos: productos.length,
          productosActivos: activos.length,
          productosStockBajo: stockBajo.length,
          valorTotalInventario: valorTotal,
          alertas: alertas
        };
      })
    );
  }

  // Helpers
  private getCategoriaNombre(id: number): string {
    const categorias = ['Instrumental', 'Materiales Dentales', 'Anestésicos', 'Higiene', 'Consumibles', 'Farmacia'];
    return categorias[id - 1] || 'Sin categoría';
  }

  private getProveedorNombre(id: number): string {
    const proveedores = ['Dental Supply CR', 'MediDental', 'OdontoMax', 'Suministros Médicos SA'];
    return proveedores[id - 1] || 'Sin proveedor';
  }

  private calcularUrgencia(stockActual: number, stockMinimo: number): 'alta' | 'media' | 'baja' {
    const porcentaje = (stockActual / stockMinimo) * 100;
    if (porcentaje <= 25) return 'alta';
    if (porcentaje <= 50) return 'media';
    return 'baja';
  }

  // Datos mock
  private getProductosMock(): ProductoInventario[] {
    return [
      {
        id: 1,
        codigo: 'GUANT-001',
        nombre: 'Guantes de Látex',
        descripcion: 'Guantes de látex sin polvo, talla M',
        categoriaId: 5,
        categoriaNombre: 'Consumibles',
        stockActual: 5,
        stockMinimo: 10,
        stockMaximo: 50,
        unidadMedida: 'Caja',
        proveedorId: 1,
        proveedorNombre: 'Dental Supply CR',
        costoUnitario: 8500,
        ubicacion: 'Estante A-1',
        activo: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        codigo: 'ANEST-001',
        nombre: 'Anestesia Local',
        descripcion: 'Lidocaína 2% con epinefrina',
        categoriaId: 3,
        categoriaNombre: 'Anestésicos',
        stockActual: 15,
        stockMinimo: 20,
        stockMaximo: 100,
        unidadMedida: 'Unidad',
        proveedorId: 2,
        proveedorNombre: 'MediDental',
        costoUnitario: 3500,
        precioVenta: 5000,
        ubicacion: 'Refrigerador',
        activo: true,
        createdAt: new Date('2024-01-16')
      },
      {
        id: 3,
        codigo: 'AMAL-001',
        nombre: 'Amalgama Dental',
        descripcion: 'Amalgama de plata para obturaciones',
        categoriaId: 2,
        categoriaNombre: 'Materiales Dentales',
        stockActual: 8,
        stockMinimo: 10,
        stockMaximo: 30,
        unidadMedida: 'Unidad',
        proveedorId: 3,
        proveedorNombre: 'OdontoMax',
        costoUnitario: 12000,
        precioVenta: 18000,
        ubicacion: 'Estante B-2',
        activo: true,
        createdAt: new Date('2024-01-17')
      },
      {
        id: 4,
        codigo: 'DESF-001',
        nombre: 'Desinfectante de Superficies',
        descripcion: 'Desinfectante para superficies clínicas',
        categoriaId: 4,
        categoriaNombre: 'Higiene',
        stockActual: 25,
        stockMinimo: 10,
        stockMaximo: 50,
        unidadMedida: 'Litro',
        proveedorId: 4,
        proveedorNombre: 'Suministros Médicos SA',
        costoUnitario: 5500,
        ubicacion: 'Almacén',
        activo: true,
        createdAt: new Date('2024-01-18')
      },
      {
        id: 5,
        codigo: 'RESIN-001',
        nombre: 'Resina Compuesta',
        descripcion: 'Resina fotopolimerizable A2',
        categoriaId: 2,
        categoriaNombre: 'Materiales Dentales',
        stockActual: 12,
        stockMinimo: 8,
        stockMaximo: 30,
        unidadMedida: 'Unidad',
        proveedorId: 1,
        proveedorNombre: 'Dental Supply CR',
        costoUnitario: 35000,
        precioVenta: 50000,
        ubicacion: 'Estante B-1',
        activo: true,
        createdAt: new Date('2024-01-19')
      },
      {
        id: 6,
        codigo: 'MASK-001',
        nombre: 'Mascarillas Quirúrgicas',
        descripcion: 'Mascarillas desechables de 3 capas',
        categoriaId: 5,
        categoriaNombre: 'Consumibles',
        stockActual: 30,
        stockMinimo: 20,
        stockMaximo: 100,
        unidadMedida: 'Caja',
        proveedorId: 2,
        proveedorNombre: 'MediDental',
        costoUnitario: 6000,
        ubicacion: 'Estante A-2',
        activo: true,
        createdAt: new Date('2024-01-20')
      },
      {
        id: 7,
        codigo: 'INST-001',
        nombre: 'Espejo Dental',
        descripcion: 'Espejo bucal plano #5',
        categoriaId: 1,
        categoriaNombre: 'Instrumental',
        stockActual: 20,
        stockMinimo: 15,
        stockMaximo: 50,
        unidadMedida: 'Unidad',
        proveedorId: 3,
        proveedorNombre: 'OdontoMax',
        costoUnitario: 2500,
        ubicacion: 'Estante C-1',
        activo: true,
        createdAt: new Date('2024-01-21')
      },
      {
        id: 8,
        codigo: 'ANTB-001',
        nombre: 'Amoxicilina 500mg',
        descripcion: 'Antibiótico de amplio espectro',
        categoriaId: 6,
        categoriaNombre: 'Farmacia',
        stockActual: 45,
        stockMinimo: 30,
        stockMaximo: 100,
        unidadMedida: 'Unidad',
        proveedorId: 4,
        proveedorNombre: 'Suministros Médicos SA',
        costoUnitario: 800,
        precioVenta: 1200,
        ubicacion: 'Farmacia',
        activo: true,
        createdAt: new Date('2024-01-22')
      }
    ];
  }
}