import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
        NotificationBellComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    private storageListener = () => this.ngOnInit();
    currentUser!: User | null;
    sidenavOpened = true;

    // ✅ BADGES INICIALIZADOS EN 0 (se actualizarán dinámicamente)
    menuItems: MenuItem[] = [
        {
            icon: 'dashboard',
            label: 'Dashboard',
            route: '/dashboard'
        },
        {
            icon: 'people',
            label: 'Pacientes',
            route: '/pacientes',
            badge: 0  // ✅ Se actualiza dinámicamente
        },
        {
            icon: 'badge',
            label: 'Empleados',
            route: '/empleados'
        },
        {
            icon: 'event',
            label: 'Citas',
            route: '/citas',
            badge: 0  // ✅ Se actualiza dinámicamente
        },
        {
            icon: 'schedule',
            label: 'Horarios',
            route: '/horarios'
        },
        {
            icon: 'medical_services',
            label: 'Tratamientos',
            route: '/tratamientos'
        },
        {
            icon: 'inventory_2',
            label: 'Inventario',
            route: '/inventario',
            badge: 0  // ✅ Se actualiza dinámicamente
        },
        {
            icon: 'receipt_long',
            label: 'Facturación',
            route: '/facturacion'
        },
        {
            icon: 'admin_panel_settings',
            label: 'Roles y Permisos',
            route: '/roles'
        },
        {
            icon: 'assessment',
            label: 'Reportes',
            route: '/reportes'
        }
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        // ✅ NUEVOS SERVICIOS INYECTADOS
        private pacienteService: PacienteService,
        private citaService: CitaService,
        private inventarioService: InventarioService
    ) { }

    ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        window.addEventListener('storage', this.storageListener);
        
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

    ngOnDestroy(): void {
        window.removeEventListener('storage', this.storageListener);
    }

    toggleSidenav(): void {
        this.sidenavOpened = !this.sidenavOpened;
    }

    logout(): void {
        this.authService.logout();
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
    }
}