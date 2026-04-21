import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { RolesService } from '../../core/services/roles.service';
import { User } from '../../core/models/user.model';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';

// ✅ NUEVOS IMPORTS
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
        NotificationBellComponent,
        FormsModule
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
    currentUser!: User | null;
    sidenavOpened = true;

    // ✅ BADGES INICIALIZADOS EN 0 (se actualizarán dinámicamente)
    menuItems: MenuItem[] = [
        { icon: 'dashboard',            label: 'Dashboard',        route: '/dashboard',    permission: 'dashboard.ver'    },
        { icon: 'people',               label: 'Pacientes',        route: '/pacientes',    permission: 'pacientes.ver',    badge: 0 },
        { icon: 'badge',                label: 'Empleados',        route: '/empleados',    permission: 'empleados.ver'    },
        { icon: 'event',                label: 'Citas',            route: '/citas',        permission: 'citas.ver',        badge: 0 },
        { icon: 'schedule',             label: 'Horarios',         route: '/horarios',     permission: 'empleados.ver'    },
        { icon: 'medical_services',     label: 'Tratamientos',     route: '/tratamientos', permission: 'tratamientos.ver' },
        { icon: 'inventory_2',          label: 'Inventario',       route: '/inventario',   permission: 'inventario.ver',   badge: 0 },
        { icon: 'receipt_long',         label: 'Facturación',      route: '/facturacion',  permission: 'facturacion.ver'  },
        { icon: 'admin_panel_settings', label: 'Roles y Permisos', route: '/roles',        permission: 'roles.ver'        },
        { icon: 'assessment',           label: 'Reportes',         route: '/reportes',     permission: 'reportes.ver'     },
    ];

    // Sidebar filtrado por rol del usuario actual
    get visibleMenuItems(): MenuItem[] {
        if (!this.currentUser) return [];
        const rol = (this.currentUser.rol || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
        if (rol === 'admin') return this.menuItems;
        const permisos = this.rolesService.getRolePermissions(this.currentUser.rol);
        return this.menuItems.filter(item => !item.permission || permisos.includes(item.permission));
    }

    constructor(
        private authService: AuthService,
        private router: Router,
        private rolesService: RolesService,
        // ✅ NUEVOS SERVICIOS INYECTADOS
        private pacienteService: PacienteService,
        private citaService: CitaService,
        private inventarioService: InventarioService
    ) { }

    ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        // ✅ CARGAR CONTADORES DINÁMICOS
        this.cargarContadores();
    }

    // ✅ NUEVO MÉTODO: Cargar contadores dinámicos
    cargarContadores(): void {
        // Contador de Pacientes ACTIVOS
        this.pacienteService.getPacientes().subscribe({
            next: (pacientes) => {
                const pacientesActivos = pacientes.filter(p => p.activo).length;
                const pacientesItem = this.menuItems.find(item => item.route === '/pacientes');
                if (pacientesItem) {
                    pacientesItem.badge = pacientesActivos > 0 ? pacientesActivos : undefined;
                }
            },
            error: (error) => {
                console.error('Error al cargar pacientes:', error);
            }
        });

        // Contador de Citas PENDIENTES (hoy y futuras)
        this.citaService.getCitas().subscribe({
            next: (citas) => {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                
                const citasPendientes = citas.filter(c => {
                    const fechaCita = new Date(c.fecha);
                    return fechaCita >= hoy && c.estado !== 'Cancelada' && c.estado !== 'Completada';
                }).length;

                const citasItem = this.menuItems.find(item => item.route === '/citas');
                if (citasItem) {
                    citasItem.badge = citasPendientes > 0 ? citasPendientes : undefined;
                }
            },
            error: (error) => {
                console.error('Error al cargar citas:', error);
            }
        });

        // Contador de Productos con STOCK BAJO
        this.inventarioService.getProductosBajoStock().subscribe({
            next: (productos) => {
                const inventarioItem = this.menuItems.find(item => item.route === '/inventario');
                if (inventarioItem) {
                    inventarioItem.badge = productos.length > 0 ? productos.length : undefined;
                }
            },
            error: (error) => {
                console.error('Error al cargar inventario:', error);
            }
        });
    }

    toggleSidenav(): void {
        this.sidenavOpened = !this.sidenavOpened;
    }

    logout(): void { this.authService.logout(); }

    navigateTo(route: string): void { this.router.navigate([route]); }

    // ── Buscador global ──────────────────────────────────────────────────
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

    toggleBuscador(): void {
        if (this.mostrarBuscador) { this.cerrarBuscador(); }
        else { this.abrirBuscador(); }
    }

    abrirBuscador(): void {
        this.mostrarBuscador = true;
        setTimeout(() => {
            const el = document.getElementById('search-inline-input');
            if (el) (el as HTMLInputElement).focus();
        }, 150);
    }

    onSearchBlur(): void {
        // Pequeño delay para permitir que el click en sugerencias funcione
        setTimeout(() => this.cerrarBuscador(), 200);
    }

    cerrarBuscador(): void {
        this.mostrarBuscador = false;
        this.terminoBusqueda = '';
    }

    buscar(): void {
        const q = this.terminoBusqueda.trim().toLowerCase();
        if (!q) return;
        if (['paciente','cedula'].some(k => q.includes(k)))          this.router.navigate(['/pacientes']);
        else if (['cita','agendar'].some(k => q.includes(k)))        this.router.navigate(['/citas']);
        else if (['tratamiento'].some(k => q.includes(k)))           this.router.navigate(['/tratamientos']);
        else if (['empleado','doctor'].some(k => q.includes(k)))     this.router.navigate(['/empleados']);
        else if (['inventario','producto','stock'].some(k => q.includes(k))) this.router.navigate(['/inventario']);
        else if (['factura','pago','cobro'].some(k => q.includes(k))) this.router.navigate(['/facturacion']);
        else if (['horario'].some(k => q.includes(k)))               this.router.navigate(['/horarios']);
        else if (['reporte'].some(k => q.includes(k)))               this.router.navigate(['/reportes']);
        else                                                          this.router.navigate(['/pacientes']);
        this.cerrarBuscador();
    }

    buscarDirecto(ruta: string): void {
        this.router.navigate([ruta]);
        this.cerrarBuscador();
    }

    // ── Opciones de usuario ──────────────────────────────────────────────
    irAPerfil():        void { this.router.navigate(['/perfil']); }
    irAConfiguracion(): void { this.router.navigate(['/configuracion']); }
    irAAyuda():         void { this.router.navigate(['/ayuda']); }
}