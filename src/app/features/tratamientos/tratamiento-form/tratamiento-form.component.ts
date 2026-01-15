import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TratamientoService } from '../../../core/services/tratamiento.service';
import { CategoriaTratamiento } from '../../../core/models/tratamiento.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tratamiento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './tratamiento-form.component.html',
  styleUrl: './tratamiento-form.component.scss'
})
export class TratamientoFormComponent implements OnInit {
  tratamientoForm!: FormGroup;
  categorias: CategoriaTratamiento[] = [];
  isEditMode = false;
  tratamientoId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private tratamientoService: TratamientoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();
    this.checkEditMode();
  }

  initForm(): void {
    this.tratamientoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoriaId: ['', Validators.required],
      duracionEstimada: [30, [Validators.required, Validators.min(15), Validators.max(240)]],
      costo: [0, [Validators.required, Validators.min(0)]],
      requiereAutorizacion: [false],
      observaciones: ['']
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

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tratamientoId = Number(id);
      this.cargarTratamiento();
    }
  }

  cargarTratamiento(): void {
    if (!this.tratamientoId) return;

    this.tratamientoService.getTratamientoById(this.tratamientoId).subscribe({
      next: (tratamiento) => {
        if (tratamiento) {
          this.tratamientoForm.patchValue({
            codigo: tratamiento.codigo,
            nombre: tratamiento.nombre,
            descripcion: tratamiento.descripcion,
            categoriaId: tratamiento.categoriaId,
            duracionEstimada: tratamiento.duracionEstimada,
            costo: tratamiento.costo,
            requiereAutorizacion: tratamiento.requiereAutorizacion,
            observaciones: tratamiento.observaciones || ''
          });
        } else {
          this.toastr.error('Tratamiento no encontrado', 'Error');
          this.router.navigate(['/tratamientos']);
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar el tratamiento', 'Error');
        console.error(error);
        this.router.navigate(['/tratamientos']);
      }
    });
  }

  onSubmit(): void {
    if (this.tratamientoForm.invalid) {
      this.tratamientoForm.markAllAsTouched();
      this.toastr.error('Complete todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;

    const formData = this.tratamientoForm.value;

    if (this.isEditMode && this.tratamientoId) {
      // Actualizar
      this.tratamientoService.actualizarTratamiento(this.tratamientoId, formData).subscribe({
        next: () => {
          this.toastr.success('Tratamiento actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/tratamientos']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el tratamiento', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.tratamientoService.crearTratamiento(formData).subscribe({
        next: () => {
          this.toastr.success('Tratamiento creado correctamente', '¡Éxito!');
          this.router.navigate(['/tratamientos']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.toastr.error('Error al crear el tratamiento', 'Error');
          console.error(error);
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/tratamientos']).then(() => {
      window.location.reload();
    });
  }

  // Helpers para obtener el color de la categoría seleccionada
  getCategoriaColor(): string {
    const categoriaId = this.tratamientoForm.get('categoriaId')?.value;
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.color : '#667eea';
  }

  // Getters para validaciones
  get codigo() { return this.tratamientoForm.get('codigo'); }
  get nombre() { return this.tratamientoForm.get('nombre'); }
  get descripcion() { return this.tratamientoForm.get('descripcion'); }
  get categoriaId() { return this.tratamientoForm.get('categoriaId'); }
  get duracionEstimada() { return this.tratamientoForm.get('duracionEstimada'); }
  get costo() { return this.tratamientoForm.get('costo'); }
}