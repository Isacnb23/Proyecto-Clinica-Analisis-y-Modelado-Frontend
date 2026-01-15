export interface ProductoInventario {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  
  // Stock
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidadMedida: UnidadMedida;
  
  // Proveedor
  proveedorId?: number;
  proveedorNombre?: string;
  
  // Precio
  costoUnitario: number;
  precioVenta?: number;
  
  // Ubicación
  ubicacion?: string;
  
  // Estado
  activo: boolean;
  observaciones?: string;
  
  // Auditoría
  createdAt: Date;
  updatedAt?: Date;
}

export type UnidadMedida = 'Unidad' | 'Caja' | 'Paquete' | 'Frasco' | 'Litro' | 'Kilogramo' | 'Metro';

export interface ProductoFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidadMedida: UnidadMedida;
  proveedorId?: number;
  costoUnitario: number;
  precioVenta?: number;
  ubicacion?: string;
  observaciones?: string;
}

export interface CategoriaInventario {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface MovimientoInventario {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  motivo: string;
  responsable: string;
  fecha: Date;
  observaciones?: string;
}

export interface EstadisticasInventario {
  totalProductos: number;
  productosActivos: number;
  productosStockBajo: number;
  valorTotalInventario: number;
  alertas: AlertaInventario[];
}

export interface AlertaInventario {
  productoId: number;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  urgencia: 'alta' | 'media' | 'baja';
}