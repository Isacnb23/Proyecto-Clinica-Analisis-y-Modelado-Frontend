import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// ── CSS compartido (declarado antes de los componentes) ──────────────────
const SHARED_STYLES = `
  .page-wrap { padding: 0; }
  .page-header {
    background: white; padding: 24px; border-radius: 12px;
    box-shadow: 0 2px 8px rgba(3,14,36,.1); margin-bottom: 24px;
    border-top: 4px solid #C49B63;
    h1 { display:flex; align-items:center; gap:12px; margin:0 0 6px; font-size:1.8rem; color:#030e24; font-weight:700;
         mat-icon { font-size:2rem; width:2rem; height:2rem; color:#C49B63; } }
    p { margin:0; color:#666; font-size:.95rem; }
  }
  .section-card {
    background: white; border-radius: 12px; padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(3,14,36,.08); border-top: 3px solid #C49B63;
    margin-bottom: 1.5rem;
    h3 { display:flex; align-items:center; gap:8px; margin:0 0 .5rem; color:#1a365d; font-size:1rem;
         mat-icon { color:#C49B63; font-size:1.1rem; } }
  }
  .perfil-grid { display:grid; grid-template-columns:2fr 1fr; gap:1.5rem; }
  @media(max-width:768px) { .perfil-grid { grid-template-columns:1fr; } }
  .avatar-wrap { display:flex; align-items:center; gap:1.5rem; }
  .avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#030e24,#1B3A6F); display:flex; align-items:center; justify-content:center; mat-icon { color:#C49B63; font-size:2.5rem; width:2.5rem; height:2.5rem; } }
  .avatar-wrap h2 { margin:0 0 .5rem; color:#1a365d; }
  .chip-rol { background:#f0eee8 !important; color:#C49B63 !important; font-weight:700 !important; }
  .field-list { display:flex; flex-direction:column; gap:0; }
  .field { display:flex; justify-content:space-between; padding:.65rem 0; border-bottom:1px solid #f1f5f9; }
  .field:last-child { border-bottom:none; }
  .fl { color:#6b7280; font-size:.9rem; }
  .fv { font-weight:600; color:#111827; font-size:.9rem; }
  .hint-text { color:#6b7280; font-size:.9rem; line-height:1.6; margin:0 0 1rem; }
`;

// ════════════════════════════════════════════════════════════════
// MI PERFIL
// ════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatChipsModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h1><mat-icon>person</mat-icon> Mi Perfil</h1>
    <p>Información de tu cuenta en el sistema</p>
  </div>

  <div class="perfil-grid">
    <div class="section-card">
      <div class="avatar-wrap">
        <div class="avatar"><mat-icon>account_circle</mat-icon></div>
        <div>
          <h2>{{ user?.email }}</h2>
          <mat-chip-set>
            <mat-chip class="chip-rol">{{ user?.rol | titlecase }}</mat-chip>
          </mat-chip-set>
        </div>
      </div>
      <mat-divider style="margin:1.5rem 0"></mat-divider>
      <div class="field-list">
        <div class="field"><span class="fl">Email</span><span class="fv">{{ user?.email }}</span></div>
        <div class="field"><span class="fl">Rol</span><span class="fv">{{ user?.rol | titlecase }}</span></div>
        <div class="field"><span class="fl">ID de usuario</span><span class="fv">#{{ user?.id }}</span></div>
      </div>
    </div>

    <div class="section-card">
      <h3><mat-icon>security</mat-icon> Seguridad</h3>
      <mat-divider style="margin:1rem 0"></mat-divider>
      <p class="hint-text">Para cambiar tu contraseña o datos de acceso, contacta al administrador del sistema.</p>
      <button mat-stroked-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon> Volver
      </button>
    </div>
  </div>
</div>`,
  styles: [SHARED_STYLES]
})
export class PerfilComponent {
  user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  constructor(private router: Router) {}
  volver(): void { this.router.navigate(['/dashboard']); }
}

// ════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h1><mat-icon>settings</mat-icon> Configuración</h1>
    <p>Preferencias personalizadas del sistema — se guardan en tu navegador</p>
  </div>

  <!-- Apariencia -->
  <div class="section-card">
    <h3><mat-icon>palette</mat-icon> Apariencia</h3>
    <mat-divider style="margin:.75rem 0 1rem"></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>dark_mode</mat-icon>
        <div><strong>Modo oscuro</strong><p>Cambia el tema de la aplicación</p></div>
      </div>
      <button class="toggle-btn" [class.on]="cfg.darkMode" (click)="toggle('darkMode')">
        <span class="toggle-knob"></span>
      </button>
    </div>
    <mat-divider></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>format_size</mat-icon>
        <div><strong>Tamaño de texto</strong><p>Ajusta el tamaño de la interfaz</p></div>
      </div>
      <div class="size-btns">
        <button [class.active]="cfg.fontSize==='small'"  (click)="setFontSize('small')">A</button>
        <button [class.active]="cfg.fontSize==='medium'" (click)="setFontSize('medium')" style="font-size:1rem">A</button>
        <button [class.active]="cfg.fontSize==='large'"  (click)="setFontSize('large')"  style="font-size:1.2rem">A</button>
      </div>
    </div>
  </div>

  <!-- Notificaciones -->
  <div class="section-card">
    <h3><mat-icon>notifications</mat-icon> Notificaciones</h3>
    <mat-divider style="margin:.75rem 0 1rem"></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>inventory_2</mat-icon>
        <div><strong>Alertas de stock bajo</strong><p>Notificar cuando el inventario esté bajo el mínimo</p></div>
      </div>
      <button class="toggle-btn" [class.on]="cfg.alertaStock" (click)="toggle('alertaStock')">
        <span class="toggle-knob"></span>
      </button>
    </div>
    <mat-divider></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>event</mat-icon>
        <div><strong>Recordatorio de citas</strong><p>Mostrar citas del día en el dashboard</p></div>
      </div>
      <button class="toggle-btn" [class.on]="cfg.recordatorioCitas" (click)="toggle('recordatorioCitas')">
        <span class="toggle-knob"></span>
      </button>
    </div>
    <mat-divider></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>refresh</mat-icon>
        <div><strong>Auto-actualización</strong><p>Refrescar notificaciones automáticamente</p></div>
      </div>
      <button class="toggle-btn" [class.on]="cfg.autoRefresh" (click)="toggle('autoRefresh')">
        <span class="toggle-knob"></span>
      </button>
    </div>
  </div>

  <!-- Tabla y paginación -->
  <div class="section-card">
    <h3><mat-icon>table_rows</mat-icon> Tablas</h3>
    <mat-divider style="margin:.75rem 0 1rem"></mat-divider>

    <div class="config-item">
      <div class="ci-left">
        <mat-icon>format_list_numbered</mat-icon>
        <div><strong>Filas por página</strong><p>Cantidad de registros en tablas</p></div>
      </div>
      <div class="rows-btns">
        <button *ngFor="let n of [5,10,25,50]"
          [class.active]="cfg.rowsPerPage===n"
          (click)="setRowsPerPage(n)">{{ n }}</button>
      </div>
    </div>
  </div>

  <!-- Sistema -->
  <div class="section-card">
    <h3><mat-icon>info</mat-icon> Sistema</h3>
    <mat-divider style="margin:.75rem 0 1rem"></mat-divider>
    <div class="config-item"><div class="ci-left"><mat-icon>language</mat-icon><div><strong>Idioma</strong><p>Idioma del sistema</p></div></div><span class="ci-value">Español (Costa Rica)</span></div>
    <mat-divider></mat-divider>
    <div class="config-item"><div class="ci-left"><mat-icon>payments</mat-icon><div><strong>Moneda</strong></div></div><span class="ci-value">₡ CRC</span></div>
    <mat-divider></mat-divider>
    <div class="config-item"><div class="ci-left"><mat-icon>build</mat-icon><div><strong>Versión</strong></div></div><span class="ci-value">v1.0.0</span></div>
  </div>

  <div style="display:flex;gap:1rem;margin-top:1.5rem">
    <button mat-stroked-button (click)="volver()"><mat-icon>arrow_back</mat-icon> Volver</button>
    <button mat-raised-button color="warn" (click)="resetear()"><mat-icon>restore</mat-icon> Restablecer</button>
  </div>
</div>`,
  styles: [SHARED_STYLES + `
    .config-item { display:flex; justify-content:space-between; align-items:center; padding:.9rem 0; }
    .ci-left { display:flex; align-items:center; gap:12px; flex:1; mat-icon { color:#C49B63; } strong { display:block; color:#1a365d; } p { margin:2px 0 0; font-size:.8rem; color:#6b7280; } }
    .ci-value { font-weight:600; color:#1a365d; font-size:.9rem; white-space:nowrap; }

    /* Toggle switch */
    .toggle-btn { width:46px; height:24px; border-radius:12px; background:#d1d5db; border:none; cursor:pointer; position:relative; transition:background .25s; flex-shrink:0; }
    .toggle-btn.on { background: linear-gradient(135deg,#1a5c38,#2d8653); }
    .toggle-knob { position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:white; transition:transform .25s; box-shadow:0 1px 4px rgba(0,0,0,.2); display:block; }
    .toggle-btn.on .toggle-knob { transform:translateX(22px); }

    /* Size buttons */
    .size-btns, .rows-btns { display:flex; gap:6px; }
    .size-btns button, .rows-btns button { padding:4px 10px; border:1px solid #d1d5db; border-radius:6px; background:white; cursor:pointer; color:#374151; font-weight:500; transition:all .15s; }
    .size-btns button.active, .rows-btns button.active { background:#1a365d; color:white; border-color:#1a365d; }
  `]
})
export class ConfiguracionComponent {
  cfg = this.cargar();

  constructor(private router: Router) {
    this.aplicar(); // Aplicar config al cargar
  }

  cargar() {
    const saved = localStorage.getItem('clinica_config');
    return saved ? JSON.parse(saved) : {
      darkMode: false, fontSize: 'medium', alertaStock: true,
      recordatorioCitas: true, autoRefresh: true, rowsPerPage: 10
    };
  }

  guardar() {
    localStorage.setItem('clinica_config', JSON.stringify(this.cfg));
    this.aplicar();
  }

  // ✅ Aplica los cambios al DOM
  aplicar() {
    const body = document.body;

    // Font size
    body.classList.remove('font-small', 'font-medium', 'font-large');
    body.classList.add(`font-${this.cfg.fontSize}`);

    // Dark mode
    if (this.cfg.darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  toggle(key: string) {
    (this.cfg as any)[key] = !(this.cfg as any)[key];
    this.guardar();
  }

  setFontSize(size: string) { this.cfg.fontSize = size; this.guardar(); }
  setRowsPerPage(n: number) { this.cfg.rowsPerPage = n; this.guardar(); }

  resetear() {
    if (!confirm('¿Restablecer configuración por defecto?')) return;
    localStorage.removeItem('clinica_config');
    this.cfg = this.cargar();
    this.aplicar();
  }

  volver(): void { this.router.navigate(['/dashboard']); }
}

// ════════════════════════════════════════════════════════════════
// AYUDA
// ════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
<div class="page-wrap">
  <div class="page-header">
    <h1><mat-icon>help</mat-icon> Ayuda</h1>
    <p>Guía rápida del sistema</p>
  </div>

  <div class="ayuda-grid">
    <div *ngFor="let s of secciones" class="section-card ayuda-card">
      <div class="ayuda-icon"><mat-icon>{{ s.icon }}</mat-icon></div>
      <h3>{{ s.titulo }}</h3>
      <mat-divider style="margin:.75rem 0"></mat-divider>
      <ul>
        <li *ngFor="let tip of s.tips">{{ tip }}</li>
      </ul>
    </div>
  </div>

  <div class="section-card" style="margin-top:1.5rem">
    <h3><mat-icon>support_agent</mat-icon> Soporte</h3>
    <p class="hint-text">Para soporte técnico, contacta al equipo de desarrollo:</p>
    <p class="hint-text"><strong>Clínica Dental PCA</strong> · Sistema v1.0.0 · © 2025</p>
  </div>

  <button mat-stroked-button (click)="volver()" style="margin-top:1.5rem">
    <mat-icon>arrow_back</mat-icon> Volver
  </button>
</div>`,
  styles: [SHARED_STYLES + `
    .ayuda-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.5rem; }
    .ayuda-card { display:flex; flex-direction:column; gap:.5rem; }
    .ayuda-icon { width:48px; height:48px; border-radius:10px; background:#f0eee8; display:flex; align-items:center; justify-content:center; mat-icon { color:#C49B63; font-size:1.5rem; } }
    ul { padding-left:1.2rem; margin:0; li { color:#6b7280; font-size:.88rem; margin:.3rem 0; line-height:1.4; } }
  `]
})
export class AyudaComponent {
  constructor(private router: Router) {}
  volver(): void { this.router.navigate(['/dashboard']); }

  secciones = [
    { icon: 'people', titulo: 'Pacientes', tips: [
      'Registra pacientes con sus datos completos',
      'Accede al historial de citas y tratamientos desde el perfil',
      'Usa el buscador para encontrar pacientes rápido'
    ]},
    { icon: 'event', titulo: 'Citas', tips: [
      'Crea citas desde el calendario o el botón "Nueva Cita"',
      'Confirma o cancela citas desde el detalle',
      'Las citas pendientes aparecen en el Dashboard'
    ]},
    { icon: 'medical_services', titulo: 'Tratamientos', tips: [
      'Crea tratamientos vinculados a un paciente y profesional',
      'El saldo se actualiza al registrar pagos en Facturación',
      'Filtra por categoría para encontrar tratamientos'
    ]},
    { icon: 'inventory_2', titulo: 'Inventario', tips: [
      'Crea categorías antes de agregar productos',
      'Las alertas de stock bajo aparecen en Notificaciones',
      'El código se genera automáticamente'
    ]},
    { icon: 'payments', titulo: 'Facturación', tips: [
      'Registra pagos parciales o totales por tratamiento',
      'El historial muestra todos los pagos realizados',
      'Filtra por "Con saldo pendiente" para cobros pendientes'
    ]},
    { icon: 'admin_panel_settings', titulo: 'Roles', tips: [
      'El admin gestiona todos los módulos',
      'Los permisos se guardan en el navegador',
      'Para restablecer permisos, limpia el localStorage'
    ]},
  ];
}