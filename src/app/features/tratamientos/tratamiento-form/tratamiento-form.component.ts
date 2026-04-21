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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TratamientoService } from '../../../core/services/tratamiento.service';
import { EmpleadosService } from '../../../core/services/empleados.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { ToastrService } from 'ngx-toastr';

// Categorías retornadas por GET /api/tratamientos/categorias (backend ya las tiene hardcodeadas)
interface CategoriaTrat { id: number; nombre: string; descripcion?: string; }

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
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './tratamiento-form.component.html',
  styleUrl: './tratamiento-form.component.scss'
})
export class TratamientoFormComponent implements OnInit {
  tratamientoForm!: FormGroup;
  categorias: CategoriaTrat[] = [];
  pacientes: any[] = [];
  empleados: any[] = [];
  isEditMode = false;
  tratamientoId?: number;
  loading = false;

  // Estados de tratamiento (definidos en el sistema)
  estados = [
    { id: 1, nombre: 'En Proceso' },
    { id: 2, nombre: 'Completado' },
    { id: 3, nombre: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private tratamientoService: TratamientoService,
    private empleadosService: EmpleadosService,
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();
    this.cargarPacientes();
    this.cargarEmpleados();
    this.checkEditMode();
  }

  initForm(): void {
    this.tratamientoForm = this.fb.group({
      pacienteId:   ['', Validators.required],
      empleadoId:   ['', Validators.required],
      nombre:       ['', [Validators.required, Validators.minLength(3)]],
      descripcion:  [''],
      categoriaId:  ['', Validators.required],
      fechaInicio:  ['', Validators.required],
      costoTotal:   [0, [Validators.required, Validators.min(0)]],
      numeroSesiones: [1, [Validators.required, Validators.min(1)]],
      estadoId:     [1, Validators.required],   // default: En Proceso
      notas:        ['']
    });
  }

  cargarCategorias(): void {
    this.tratamientoService.getCategorias().subscribe({
      next: (cats: any[]) => { this.categorias = cats; },
      error: () => {
        // Fallback si el endpoint falla
        this.categorias = [
          { id: 1, nombre: 'Preventivo' },
          { id: 2, nombre: 'Restaurativo' },
          { id: 3, nombre: 'Endodoncia' },
          { id: 4, nombre: 'Ortodoncia' },
          { id: 5, nombre: 'Cirugía Oral' },
          { id: 6, nombre: 'Periodoncia' },
          { id: 7, nombre: 'Estética Dental' },
          { id: 8, nombre: 'Prótesis' },
          { id: 9, nombre: 'Odontopediatría' },
          { id: 10, nombre: 'Otros' }
        ];
      }
    });
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (p: any[]) => { this.pacientes = p.filter((x: any) => x.activo !== false); },
      error: () => { this.toastr.error('Error al cargar pacientes', 'Error'); }
    });
  }

  cargarEmpleados(): void {
    this.empleadosService.getEmpleados(true).subscribe({
      next: (e: any[]) => {
        // ✅ Mostrar preferentemente odontólogos pero si no hay, mostrar todos
        const odontologos = e.filter((emp: any) =>
          (emp.rol || '').toLowerCase().includes('odont') ||
          (emp.especialidad || '').trim() !== ''
        );
        this.empleados = odontologos.length > 0 ? odontologos : e;
      },
      error: () => { this.toastr.error('Error al cargar profesionales', 'Error'); }
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
      next: (t: any) => {
        this.tratamientoForm.patchValue({
          pacienteId:    t.pacienteId,
          empleadoId:    t.empleadoId,
          nombre:        t.nombre,
          descripcion:   t.descripcion || '',
          categoriaId:   t.categoriaId,
          fechaInicio:   t.fechaInicio?.substring(0, 10),
          costoTotal:    t.costoTotal,
          numeroSesiones: t.numeroSesiones || 1,
          estadoId:      t.estadoId || 1,
          notas:         t.notas || ''
        });
      },
      error: () => {
        this.toastr.error('Error al cargar el tratamiento', 'Error');
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
    const v = this.tratamientoForm.value;

    // ✅ Body que coincide exactamente con TratamientoCreateDTO del backend
    const payload: any = {
      pacienteId:        v.pacienteId,
      empleadoId:        v.empleadoId,
      nombre:            v.nombre,
      descripcion:       v.descripcion || null,
      categoriaId:       v.categoriaId,
      fechaInicio:       v.fechaInicio instanceof Date
                           ? v.fechaInicio.toISOString()
                           : new Date(v.fechaInicio).toISOString(),
      costoTotal:        v.costoTotal,
      costoMateriales:   null,
      numeroSesiones:    v.numeroSesiones || 1,
      sesionesCompletadas: 0,
      estadoId:          v.estadoId,
      diagnostico:       null,
      notas:             v.notas || null
    };

    if (this.isEditMode && this.tratamientoId) {
      payload.id = this.tratamientoId;
      this.tratamientoService.actualizarTratamiento(this.tratamientoId, payload).subscribe({
        next: () => {
          this.toastr.success('Tratamiento actualizado correctamente', '¡Éxito!');
          this.router.navigate(['/tratamientos']);
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'Error al actualizar', 'Error');
          this.loading = false;
        }
      });
    } else {
      this.tratamientoService.crearTratamiento(payload).subscribe({
        next: () => {
          this.toastr.success('Tratamiento creado correctamente', '¡Éxito!');
          this.router.navigate(['/tratamientos']);
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'Error al crear tratamiento', 'Error');
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void { this.router.navigate(['/tratamientos']); }

  // Getters para validaciones en el template
  get pacienteIdCtrl()  { return this.tratamientoForm.get('pacienteId'); }
  get empleadoIdCtrl()  { return this.tratamientoForm.get('empleadoId'); }
  get nombre()          { return this.tratamientoForm.get('nombre'); }
  get descripcion()     { return this.tratamientoForm.get('descripcion'); }
  get categoriaId()     { return this.tratamientoForm.get('categoriaId'); }
  get fechaInicioCtrl() { return this.tratamientoForm.get('fechaInicio'); }
  get costoTotal()      { return this.tratamientoForm.get('costoTotal'); }
}