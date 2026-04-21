import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    FormsModule,
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

  // Modal crear categoría
  mostrarModalCategoria = false;
  nuevaCategoria = { nombre: '', descripcion: '' };
  creandoCategoria = false;

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

  // Genera código automático tipo PROD-20260420-001
  generarCodigo(): string {
    const hoy = new Date();
    const fecha = hoy.toISOString().slice(2,10).replace(/-/g,'');
    const rand = Math.floor(Math.random() * 900) + 100;
    return `PROD-${fecha}-${rand}`;
  }

  initForm(): void {
    this.productoForm = this.fb.group({
      codigo: [this.generarCodigo(), [Validators.required, Validators.minLength(3)]],
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
      error: () => { this.proveedores = []; }
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
          // ✅ Mapear campos del backend (CategoriaInventarioId → categoriaId)
          this.productoForm.patchValue({
            codigo:       (producto as any).codigo,
            nombre:       (producto as any).nombre,
            descripcion:  (producto as any).descripcion || '',
            categoriaId:  (producto as any).categoriaInventarioId ?? (producto as any).categoriaId,
            stockActual:  (producto as any).stockActual ?? 0,
            stockMinimo:  (producto as any).stockMinimo ?? 0,
            stockMaximo:  (producto as any).stockMinimo ?? 0,   // backend no devuelve stockMaximo
            unidadMedida: (producto as any).unidadMedida || 'Unidad',
            costoUnitario:(producto as any).precioUnitario ?? 0,
            precioVenta:  0,
            ubicacion:    '',
            observaciones:''
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

    const v = this.productoForm.value;

    // ✅ Payload que coincide EXACTAMENTE con ProductoInventarioCreateDTO/UpdateDTO del backend
    const payload: any = {
      categoriaInventarioId: v.categoriaId,   // ← nombre correcto para el backend
      codigo:       v.codigo,
      nombre:       v.nombre,
      descripcion:  v.descripcion || null,
      unidadMedida: v.unidadMedida || 'Unidad',
      stockActual:  v.stockActual ?? 0,
      stockMinimo:  v.stockMinimo ?? 0,
      precioUnitario: v.costoUnitario ?? 0,   // ← nombre correcto para el backend
      activo:       true
    };

    if (this.isEditMode && this.productoId) {
      this.inventarioService.actualizarProducto(this.productoId, payload).subscribe({
        next: () => {
          this.toastr.success('Producto actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/inventario']);
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'Error al actualizar el producto', 'Error');
          this.loading = false;
        }
      });
    } else {
      this.inventarioService.crearProducto(payload).subscribe({
        next: () => {
          this.toastr.success('Producto creado correctamente', '¡Éxito!');
          this.router.navigate(['/inventario']);
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'Error al crear el producto', 'Error');
          this.loading = false;
        }
      });
    }
  }

  abrirModalCategoria(): void {
    this.nuevaCategoria = { nombre: '', descripcion: '' };
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.creandoCategoria = false;
  }

  guardarCategoria(): void {
    if (!this.nuevaCategoria.nombre.trim()) {
      this.toastr.warning('El nombre de la categoría es requerido.');
      return;
    }
    this.creandoCategoria = true;
    this.inventarioService.crearCategoria(
      this.nuevaCategoria.nombre,
      this.nuevaCategoria.descripcion
    ).subscribe({
      next: (cat: any) => {
        this.toastr.success('Categoría creada correctamente.');
        this.cerrarModalCategoria();
        this.cargarCategorias();
        setTimeout(() => {
          this.productoForm.patchValue({ categoriaId: cat.id });
        }, 400);
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Error al crear categoría.');
        this.creandoCategoria = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
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