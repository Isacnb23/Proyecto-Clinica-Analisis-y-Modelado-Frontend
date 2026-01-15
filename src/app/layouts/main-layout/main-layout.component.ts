import { Component, OnInit } from '@angular/core';
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
        MatDividerModule
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
    currentUser: User | null = null;
    sidenavOpened = true;

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
            badge: 5
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
            badge: 12
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
            badge: 3
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
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
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