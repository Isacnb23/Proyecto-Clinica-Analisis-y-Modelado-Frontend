import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoInventario, CategoriaInventario, EstadisticasInventario } from '../../core/models/inventario.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'categoria',
    'stock',
    'unidad',
    'costo',
    'proveedor',
    'ubicacion',
    'estado',
    'acciones'
  ];

  dataSource: MatTableDataSource<ProductoInventario>;
  categorias: CategoriaInventario[] = [];
  estadisticas?: EstadisticasInventario;
  categoriaSeleccionada?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private inventarioService: InventarioService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dataSource = new MatTableDataSource<ProductoInventario>([]);
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarEstadisticas();
  }

  cargarProductos(): void {
    this.inventarioService.getProductos().subscribe({
      next: (productos) => {
        this.dataSource.data = productos;
        
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        // Configurar filtro personalizado
        this.dataSource.filterPredicate = (data: ProductoInventario, filter: string) => {
          const searchStr = filter.toLowerCase();
          return data.nombre.toLowerCase().includes(searchStr) ||
                 data.codigo.toLowerCase().includes(searchStr) ||
                 data.descripcion.toLowerCase().includes(searchStr) ||
                 data.categoriaNombre.toLowerCase().includes(searchStr);
        };
      },
      error: (error) => {
        this.toastr.error('Error al cargar productos', 'Error');
        console.error(error);
      }
    });
  }

  cargarCategorias(): void {
    this.inventarioService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        this.toastr.error('Error al cargar categorías', 'Error');
        console.error(error);
      }
    });
  }

  cargarEstadisticas(): void {
    this.inventarioService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas', error);
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filtrarPorCategoria(categoriaId?: number): void {
    this.categoriaSeleccionada = categoriaId;

    if (categoriaId) {
      this.inventarioService.getProductosByCategoria(categoriaId).subscribe({
        next: (productos) => {
          this.dataSource.data = productos;
        }
      });
    } else {
      this.cargarProductos();
    }
  }

  verStockBajo(): void {
    this.inventarioService.getProductosStockBajo().subscribe({
      next: (productos) => {
        this.dataSource.data = productos;
        this.toastr.info(`${productos.length} productos con stock bajo`, 'Alertas');
      }
    });
  }

  verDetalle(producto: ProductoInventario): void {
    this.router.navigate(['/inventario', producto.id]);
  }

  editarProducto(producto: ProductoInventario): void {
    this.router.navigate(['/inventario', 'editar', producto.id]);
  }

  eliminarProducto(producto: ProductoInventario): void {
    if (confirm(`¿Está seguro de desactivar el producto "${producto.nombre}"?`)) {
      this.inventarioService.eliminarProducto(producto.id).subscribe({
        next: () => {
          this.toastr.success('Producto desactivado correctamente', 'Éxito');
          this.cargarProductos();
          this.cargarEstadisticas();
        },
        error: (error) => {
          this.toastr.error('Error al desactivar producto', 'Error');
          console.error(error);
        }
      });
    }
  }

  activarProducto(producto: ProductoInventario): void {
    this.inventarioService.activarProducto(producto.id).subscribe({
      next: () => {
        this.toastr.success('Producto activado correctamente', 'Éxito');
        this.cargarProductos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        this.toastr.error('Error al activar producto', 'Error');
        console.error(error);
      }
    });
  }

  nuevoProducto(): void {
    this.router.navigate(['/inventario', 'nuevo']);
  }

  getCategoriaById(id: number): CategoriaInventario | undefined {
    return this.categorias.find(c => c.id === id);
  }

  getStockClass(producto: ProductoInventario): string {
    if (producto.stockActual === 0) return 'stock-agotado';
    if (producto.stockActual <= producto.stockMinimo) return 'stock-bajo';
    if (producto.stockActual >= producto.stockMaximo) return 'stock-alto';
    return 'stock-normal';
  }

  getStockIcon(producto: ProductoInventario): string {
    if (producto.stockActual === 0) return 'cancel';
    if (producto.stockActual <= producto.stockMinimo) return 'warning';
    if (producto.stockActual >= producto.stockMaximo) return 'info';
    return 'check_circle';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(value);
  }

  getUrgenciaClass(urgencia: string): string {
    return `urgencia-${urgencia}`;
  }
}