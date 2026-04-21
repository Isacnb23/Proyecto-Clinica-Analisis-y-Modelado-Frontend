import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { RolesService } from '../../core/services/roles.service';
import { User } from '../../core/models/user.model';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { InventarioService } from '../../core/services/inventario.service';

interface MenuItem {
    icon: string;
    label: string;
    route: string;
    badge?: number;
    permission?: string;
}

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDividerModule,
        NotificationBellComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    currentUser!: User | null;
    sidenavOpened = true;

    private storageListener = () => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    };

    menuItems: MenuItem[] = [
        { icon: 'dashboard',            label: 'Dashboard',        route: '/dashboard',    permission: 'dashboard.ver'    },
        { icon: 'people',               label: 'Pacientes',        route: '/pacientes',    permission: 'pacientes.ver',    badge: 0 },
        { icon: 'badge',                label: 'Empleados',        route: '/empleados',    permission: 'empleados.ver'    },
        { icon: 'event',                label: 'Citas',            route: '/citas',        permission: 'citas.ver',        badge: 0 },
        { icon: 'schedule',             label: 'Horarios',         route: '/horarios',     permission: 'citas.ver'        },
        { icon: 'medical_services',     label: 'Tratamientos',     route: '/tratamientos', permission: 'tratamientos.ver' },
        { icon: 'inventory_2',          label: 'Inventario',       route: '/inventario',   permission: 'inventario.ver',   badge: 0 },
        { icon: 'receipt_long',         label: 'Facturación',      route: '/facturacion',  permission: 'facturacion.ver'  },
        { icon: 'admin_panel_settings', label: 'Roles y Permisos', route: '/roles',        permission: 'roles.ver'        },
        { icon: 'assessment',           label: 'Reportes',         route: '/reportes',     permission: 'reportes.ver'     },
    ];

    get visibleMenuItems(): MenuItem[] {
        if (!this.currentUser) return [];
        const rol = (this.currentUser.rol || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
        if (rol === 'admin') return this.menuItems;
        const permisos = this.rolesService.getRolePermissions(this.currentUser.rol);
        return this.menuItems.filter(item => !item.permission || permisos.includes(item.permission));
    }

    // Buscador
    mostrarBuscador = false;
    terminoBusqueda = '';

    sugerencias = [
        { icon: 'people',           label: 'Pacientes',    ruta: '/pacientes'    },
        { icon: 'event',            label: 'Citas',        ruta: '/citas'        },
        { icon: 'medical_services', label: 'Tratamientos', ruta: '/tratamientos' },
        { icon: 'inventory_2',      label: 'Inventario',   ruta: '/inventario'   },
        { icon: 'payments',         label: 'Facturación',  ruta: '/facturacion'  },
        { icon: 'assessment',       label: 'Reportes',     ruta: '/reportes'     },
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        private rolesService: RolesService,
        private pacienteService: PacienteService,
        private citaService: CitaService,
        private inventarioService: InventarioService
    ) { }

    ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        window.addEventListener('storage', this.storageListener);
        this.cargarContadores();
    }

    ngOnDestroy(): void {
        window.removeEventListener('storage', this.storageListener);
    }

    cargarContadores(): void {
        this.pacienteService.getPacientes().subscribe({
            next: (pacientes) => {
                const activos = pacientes.filter((p: any) => p.activo !== false).length;
                const item = this.menuItems.find(i => i.route === '/pacientes');
                if (item) item.badge = activos > 0 ? activos : undefined;
            },
            error: () => {}
        });

        this.citaService.getCitas().subscribe({
            next: (citas) => {
                const hoy = new Date(); hoy.setHours(0,0,0,0);
                const pendientes = citas.filter((c: any) => {
                    const f = new Date(c.fecha); return f >= hoy && c.estado !== 'Cancelada' && c.estado !== 'Completada';
                }).length;
                const item = this.menuItems.find(i => i.route === '/citas');
                if (item) item.badge = pendientes > 0 ? pendientes : undefined;
            },
            error: () => {}
        });

        this.inventarioService.getProductosBajoStock().subscribe({
            next: (productos: any[]) => {
                const item = this.menuItems.find(i => i.route === '/inventario');
                if (item) item.badge = productos.length > 0 ? productos.length : undefined;
            },
            error: () => {}
        });
    }

    toggleSidenav(): void { this.sidenavOpened = !this.sidenavOpened; }
    logout(): void { this.authService.logout(); }
    navigateTo(route: string): void { this.router.navigate([route]); }

    // Buscador
    abrirBuscador(): void {
        this.mostrarBuscador = true;
        setTimeout(() => { const el = document.getElementById('search-inline-input'); if (el) (el as HTMLInputElement).focus(); }, 150);
    }

    cerrarBuscador(): void { this.mostrarBuscador = false; this.terminoBusqueda = ''; }

    toggleBuscador(): void { if (this.mostrarBuscador) this.cerrarBuscador(); else this.abrirBuscador(); }

    onSearchBlur(): void { setTimeout(() => this.cerrarBuscador(), 200); }

    buscar(): void {
        const q = this.terminoBusqueda.trim().toLowerCase();
        if (!q) return;
        if (['paciente','cedula'].some(k => q.includes(k)))               this.router.navigate(['/pacientes']);
        else if (['cita','agendar'].some(k => q.includes(k)))             this.router.navigate(['/citas']);
        else if (['tratamiento'].some(k => q.includes(k)))                this.router.navigate(['/tratamientos']);
        else if (['empleado','doctor'].some(k => q.includes(k)))          this.router.navigate(['/empleados']);
        else if (['inventario','producto','stock'].some(k => q.includes(k))) this.router.navigate(['/inventario']);
        else if (['factura','pago','cobro'].some(k => q.includes(k)))     this.router.navigate(['/facturacion']);
        else if (['horario'].some(k => q.includes(k)))                    this.router.navigate(['/horarios']);
        else if (['reporte'].some(k => q.includes(k)))                    this.router.navigate(['/reportes']);
        else                                                               this.router.navigate(['/pacientes']);
        this.cerrarBuscador();
    }

    buscarDirecto(ruta: string): void { this.router.navigate([ruta]); this.cerrarBuscador(); }

    irAPerfil():        void { this.router.navigate(['/perfil']); }
    irAConfiguracion(): void { this.router.navigate(['/configuracion']); }
    irAAyuda():         void { this.router.navigate(['/ayuda']); }
}