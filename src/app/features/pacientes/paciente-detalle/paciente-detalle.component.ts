import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models/paciente.model';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-paciente-detalle',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatTabsModule
    ],
    templateUrl: './paciente-detalle.component.html',
    styleUrl: './paciente-detalle.component.scss'
})
export class PacienteDetalleComponent implements OnInit {
    paciente?: Paciente;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private pacienteService: PacienteService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarPaciente(Number(id));
        }
    }

    cargarPaciente(id: number): void {
        this.pacienteService.getPacienteById(id).subscribe({
            next: (paciente) => {
                this.paciente = paciente;
                this.loading = false;
            },
            error: (error) => {
                this.toastr.error('Error al cargar el paciente', 'Error');
                console.error(error);
                this.loading = false;
                this.router.navigate(['/pacientes']);
            }
        });
    }

    getNombreCompleto(): string {
        if (!this.paciente) return '';
        return `${this.paciente.nombre} ${this.paciente.apellido1} ${this.paciente.apellido2 || ''}`.trim();
    }

    editarPaciente(): void {
        this.router.navigate(['/pacientes', 'editar', this.paciente?.id]);
    }

    volver(): void {
        this.router.navigate(['/pacientes']).then(() => {
            window.location.reload();
        });
    }

    agendarCita(): void {
        this.toastr.info('Función en desarrollo', 'Próximamente');
    }

    verHistoriaClinica(): void {
        this.toastr.info('Función en desarrollo', 'Próximamente');
    }
}