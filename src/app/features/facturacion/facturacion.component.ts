import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FacturacionService, TratamientoFactura, PagoResponse, PagoCreate, METODOS_PAGO
} from '../../core/services/facturacion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatDividerModule,
    MatPaginatorModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.scss'
})
export class FacturacionComponent implements OnInit, AfterViewInit {

  displayedColumns = ['paciente', 'tratamiento', 'costo', 'pagado', 'saldo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<TratamientoFactura>([]);
  todos: TratamientoFactura[] = [];
  cargando = true;
  filtroEstado = 'todos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalCobrado   = 0;
  totalPendiente = 0;
  conPendiente   = 0;
  alDia          = 0;

  tratamientoDetalle: TratamientoFactura | null = null;
  pagosDetalle: PagoResponse[] = [];
  cargandoPagos = false;

  mostrarModal = false;
  tratSeleccionado: TratamientoFactura | null = null;
  saldoActual  = 0;
  guardando    = false;
  metodosPago  = METODOS_PAGO;
  pago: PagoCreate = { tratamientoId: 0, monto: 0, metodoPagoId: 0 };

  constructor(
    private facturacionService: FacturacionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void { this.cargar(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargar(): void {
    this.cargando = true;
    this.facturacionService.getTratamientosFacturacion().subscribe({
      next: (data: any[]) => {
        this.todos = data.map((t: any) => ({
          ...t,
          costoTotal:     t.costoTotal  ?? 0,
          montoPagado:    t.montoPagado ?? 0,
          saldo:          t.saldo       ?? (t.costoTotal - (t.montoPagado ?? 0)),
          pacienteNombre: t.pacienteNombre || `Paciente #${t.pacienteId}`,
          empleadoNombre: t.empleadoNombre || ''
        }));
        this.calcularKpis();
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => { this.cargando = false; this.toastr.error('Error al cargar facturación'); }
    });
  }

  calcularKpis(): void {
    this.totalCobrado   = this.todos.reduce((s, t) => s + t.montoPagado, 0);
    this.totalPendiente = this.todos.reduce((s, t) => s + t.saldo, 0);
    this.conPendiente   = this.todos.filter(t => t.saldo > 0).length;
    this.alDia          = this.todos.filter(t => t.saldo <= 0).length;
  }

  aplicarFiltro(busqueda = ''): void {
    let base = [...this.todos];
    if (this.filtroEstado === 'pendiente') base = base.filter(t => t.saldo > 0);
    if (this.filtroEstado === 'pagado')    base = base.filter(t => t.saldo <= 0);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      base = base.filter(t =>
        (t.pacienteNombre || '').toLowerCase().includes(q) ||
        t.nombre.toLowerCase().includes(q)
      );
    }
    this.dataSource.data = base;
    if (this.paginator) this.dataSource.paginator = this.paginator;
  }

  onBuscar(e: Event): void { this.aplicarFiltro((e.target as HTMLInputElement).value); }
  onFiltroChange(): void   { this.aplicarFiltro(); }

  toggleHistorial(t: TratamientoFactura): void {
    if (this.tratamientoDetalle?.id === t.id) {
      this.tratamientoDetalle = null; this.pagosDetalle = []; return;
    }
    this.tratamientoDetalle = t;
    this.cargandoPagos = true;
    this.pagosDetalle = [];
    this.facturacionService.getPagosPorTratamiento(t.id).subscribe({
      next: (p) => { this.pagosDetalle = p; this.cargandoPagos = false; },
      error: () => { this.pagosDetalle = []; this.cargandoPagos = false; }
    });
  }

  abrirPago(t: TratamientoFactura): void {
    this.tratSeleccionado = t;
    this.saldoActual = t.saldo;
    this.pago = { tratamientoId: t.id, monto: t.saldo, metodoPagoId: 0,
                  numeroReferencia: '', notas: '' };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false; this.tratSeleccionado = null; this.guardando = false;
  }

  guardarPago(): void {
    if (!this.pago.monto || this.pago.monto <= 0)    { this.toastr.warning('Ingrese un monto válido'); return; }
    if (this.pago.monto > this.saldoActual)           { this.toastr.warning('El monto supera el saldo'); return; }
    if (!this.pago.metodoPagoId)                      { this.toastr.warning('Seleccione método de pago'); return; }
    this.guardando = true;
    this.facturacionService.registrarPago(this.pago).subscribe({
      next: () => {
        this.toastr.success('Pago registrado correctamente', '¡Éxito!');
        this.cerrarModal();
        this.tratamientoDetalle = null;
        this.pagosDetalle = [];
        this.cargar();
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Error al registrar el pago');
        this.guardando = false;
      }
    });
  }

  getEstadoBadge(t: TratamientoFactura): string { return t.saldo <= 0 ? 'Al día' : 'Pendiente'; }
  getEstadoClass(t: TratamientoFactura): string  { return t.saldo <= 0 ? 'chip-pagado' : 'chip-pendiente'; }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency', currency: 'CRC', minimumFractionDigits: 0
    }).format(v ?? 0);
  }
}