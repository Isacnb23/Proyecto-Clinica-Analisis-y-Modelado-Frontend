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
import { FormsModule } from '@angular/forms';
import { TratamientoService } from '../../core/services/tratamiento.service';
import { Tratamiento, CategoriaTratamiento } from '../../core/models/tratamiento.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tratamientos',
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
    MatDividerModule
  ],
  templateUrl: './tratamientos.component.html',
  styleUrl: './tratamientos.component.scss'
})
export class TratamientosComponent implements OnInit {
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'categoria',
    'duracion',
    'costo',
    'autorizacion',
    'estado',
    'acciones'
  ];

  dataSource: MatTableDataSource<Tratamiento>;
  categorias: CategoriaTratamiento[] = [];
  categoriaSeleccionada?: number;

  // Estadísticas
  totalTratamientos = 0;
  tratamientosActivos = 0;
  tratamientosInactivos = 0;
  promedioPrecios = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tratamientoService: TratamientoService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dataSource = new MatTableDataSource<Tratamiento>([]);
  }

  ngOnInit(): void {
    this.cargarTratamientos();
    this.cargarCategorias();
  }

  cargarTratamientos(): void {
    this.tratamientoService.getTratamientos().subscribe({
      next: (tratamientos) => {
        this.dataSource.data = tratamientos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Configurar filtro personalizado
        this.dataSource.filterPredicate = (data: Tratamiento, filter: string) => {
          const searchStr = filter.toLowerCase();
          return data.nombre.toLowerCase().includes(searchStr) ||
                 data.codigo.toLowerCase().includes(searchStr) ||
                 data.descripcion.toLowerCase().includes(searchStr) ||
                 data.categoriaNombre.toLowerCase().includes(searchStr);
        };

        // Calcular estadísticas
        this.calcularEstadisticas(tratamientos);
      },
      error: (error) => {
        this.toastr.error('Error al cargar tratamientos', 'Error');
        console.error(error);
      }
    });
  }

  cargarCategorias(): void {
    this.tratamientoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        this.toastr.error('Error al cargar categorías', 'Error');
        console.error(error);
      }
    });
  }

  calcularEstadisticas(tratamientos: Tratamiento[]): void {
    this.totalTratamientos = tratamientos.length;
    this.tratamientosActivos = tratamientos.filter(t => t.activo).length;
    this.tratamientosInactivos = tratamientos.filter(t => !t.activo).length;

    if (tratamientos.length > 0) {
      const sumaPrecios = tratamientos.reduce((sum, t) => sum + t.costo, 0);
      this.promedioPrecios = Math.round(sumaPrecios / tratamientos.length);
    }
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
      this.tratamientoService.getTratamientosByCategoria(categoriaId).subscribe({
        next: (tratamientos) => {
          this.dataSource.data = tratamientos;
        }
      });
    } else {
      this.cargarTratamientos();
    }
  }

  verDetalle(tratamiento: Tratamiento): void {
    this.router.navigate(['/tratamientos', tratamiento.id]);
  }

  editarTratamiento(tratamiento: Tratamiento): void {
    this.router.navigate(['/tratamientos', 'editar', tratamiento.id]);
  }

  eliminarTratamiento(tratamiento: Tratamiento): void {
    if (confirm(`¿Está seguro de desactivar el tratamiento "${tratamiento.nombre}"?`)) {
      this.tratamientoService.eliminarTratamiento(tratamiento.id).subscribe({
        next: () => {
          this.toastr.success('Tratamiento desactivado correctamente', 'Éxito');
          this.cargarTratamientos();
        },
        error: (error) => {
          this.toastr.error('Error al desactivar tratamiento', 'Error');
          console.error(error);
        }
      });
    }
  }

  activarTratamiento(tratamiento: Tratamiento): void {
    this.tratamientoService.activarTratamiento(tratamiento.id).subscribe({
      next: () => {
        this.toastr.success('Tratamiento activado correctamente', 'Éxito');
        this.cargarTratamientos();
      },
      error: (error) => {
        this.toastr.error('Error al activar tratamiento', 'Error');
        console.error(error);
      }
    });
  }

  nuevoTratamiento(): void {
    this.router.navigate(['/tratamientos', 'nuevo']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(value);
  }

  getCategoriaById(id: number): CategoriaTratamiento | undefined {
    return this.categorias.find(c => c.id === id);
  }
}