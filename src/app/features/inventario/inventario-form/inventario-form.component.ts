import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { InventarioService } from '../../../core/services/inventario.service';
import { CategoriaInventario, Proveedor } from '../../../core/models/inventario.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './inventario-form.component.html',
  styleUrl: './inventario-form.component.scss'
})
export class InventarioFormComponent implements OnInit {
  productoForm!: FormGroup;
  categorias: CategoriaInventario[] = [];
  proveedores: Proveedor[] = [];
  isEditMode = false;
  productoId?: number;
  loading = false;

  unidadesMedida = ['Unidad', 'Caja', 'Paquete', 'Frasco', 'Litro', 'Kilogramo', 'Metro'];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();
    this.cargarProveedores();
    this.checkEditMode();
  }

  initForm(): void {
    this.productoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoriaId: ['', Validators.required],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      stockMaximo: [0, [Validators.required, Validators.min(1)]],
      unidadMedida: ['Unidad', Validators.required],
      proveedorId: [''],
      costoUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, Validators.min(0)],
      ubicacion: [''],
      observaciones: ['']
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

  cargarProveedores(): void {
    this.inventarioService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
      },
      error: (error) => {
        this.toastr.error('Error al cargar proveedores', 'Error');
        console.error(error);
      }
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productoId = Number(id);
      this.cargarProducto();
    }
  }

  cargarProducto(): void {
    if (!this.productoId) return;

    this.inventarioService.getProductoById(this.productoId).subscribe({
      next: (producto) => {
        if (producto) {
          this.productoForm.patchValue({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            categoriaId: producto.categoriaId,
            stockActual: producto.stockActual,
            stockMinimo: producto.stockMinimo,
            stockMaximo: producto.stockMaximo,
            unidadMedida: producto.unidadMedida,
            proveedorId: producto.proveedorId || '',
            costoUnitario: producto.costoUnitario,
            precioVenta: producto.precioVenta || 0,
            ubicacion: producto.ubicacion || '',
            observaciones: producto.observaciones || ''
          });
        } else {
          this.toastr.error('Producto no encontrado', 'Error');
          this.router.navigate(['/inventario']);
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el producto', 'Error');
        console.error(error);
        this.router.navigate(['/inventario']);
      }
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    // Validar que stockMaximo sea mayor que stockMinimo
    const stockMin = this.productoForm.get('stockMinimo')?.value;
    const stockMax = this.productoForm.get('stockMaximo')?.value;
    
    if (stockMax <= stockMin) {
      this.toastr.error('El stock máximo debe ser mayor al stock mínimo', 'Error');
      return;
    }

    this.loading = true;

    const formData = this.productoForm.value;

    if (this.isEditMode && this.productoId) {
      // Actualizar
      this.inventarioService.actualizarProducto(this.productoId, formData).subscribe({
        next: () => {
          this.toastr.success('Producto actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/inventario']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el producto', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.inventarioService.crearProducto(formData).subscribe({
        next: () => {
          this.toastr.success('Producto creado correctamente', '¡Éxito!');
          this.router.navigate(['/inventario']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al crear el producto', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/inventario']).then(() => {
      window.location.reload();
    });
  }

  getCategoriaColor(): string {
    const categoriaId = this.productoForm.get('categoriaId')?.value;
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.color : '#667eea';
  }

  // Getters para validaciones
  get codigo() { return this.productoForm.get('codigo'); }
  get nombre() { return this.productoForm.get('nombre'); }
  get descripcion() { return this.productoForm.get('descripcion'); }
  get categoriaId() { return this.productoForm.get('categoriaId'); }
  get stockActual() { return this.productoForm.get('stockActual'); }
  get stockMinimo() { return this.productoForm.get('stockMinimo'); }
  get stockMaximo() { return this.productoForm.get('stockMaximo'); }
  get unidadMedida() { return this.productoForm.get('unidadMedida'); }
  get costoUnitario() { return this.productoForm.get('costoUnitario'); }
  get precioVenta() { return this.productoForm.get('precioVenta'); }
}
