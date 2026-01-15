import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EstadisticasDashboard } from '../models/estadistica.model';

@Injectable({
  providedIn: 'root'
})
export class EstadisticaService {

  constructor() {}

  getEstadisticas(): Observable<EstadisticasDashboard> {
    // Datos simulados - después conectaremos con API real
    const estadisticas: EstadisticasDashboard = {
      // Resumen general
      totalPacientes: 247,
      pacientesActivos: 198,
      citasHoy: 12,
      citasSemana: 48,
      tratamientosActivos: 34,
      ingresosmes: 2850000, // En colones
      
      // Citas por mes (últimos 6 meses)
      citasPorMes: [
        { mes: 'Julio', cantidad: 45 },
        { mes: 'Agosto', cantidad: 52 },
        { mes: 'Septiembre', cantidad: 48 },
        { mes: 'Octubre', cantidad: 61 },
        { mes: 'Noviembre', cantidad: 55 },
        { mes: 'Diciembre', cantidad: 38 }
      ],
      
      // Tratamientos más realizados
      tratamientosMasRealizados: [
        { nombre: 'Limpieza Dental', cantidad: 89, color: '#667eea' },
        { nombre: 'Ortodoncia', cantidad: 45, color: '#764ba2' },
        { nombre: 'Blanqueamiento', cantidad: 34, color: '#f093fb' },
        { nombre: 'Endodoncia', cantidad: 28, color: '#4facfe' },
        { nombre: 'Extracción', cantidad: 22, color: '#43e97b' }
      ],
      
      // Ingresos mensuales (últimos 6 meses en miles de colones)
      ingresosMensuales: [
        { mes: 'Jul', ingresos: 2450 },
        { mes: 'Ago', ingresos: 2780 },
        { mes: 'Sep', ingresos: 2590 },
        { mes: 'Oct', ingresos: 3120 },
        { mes: 'Nov', ingresos: 2950 },
        { mes: 'Dic', ingresos: 2850 }
      ],
      
      // Pacientes nuevos vs recurrentes (este mes)
      pacientesNuevosVsRecurrentes: {
        nuevos: 23,
        recurrentes: 175
      },
      
      // Próximas citas de hoy
      proximasCitas: [
        {
          id: 1,
          paciente: 'María González',
          tratamiento: 'Limpieza Dental',
          fecha: new Date(),
          hora: '09:00 AM',
          odontologo: 'Dr. Juan Pérez'
        },
        {
          id: 2,
          paciente: 'Carlos Rodríguez',
          tratamiento: 'Ortodoncia - Control',
          fecha: new Date(),
          hora: '10:30 AM',
          odontologo: 'Dra. Ana Mora'
        },
        {
          id: 3,
          paciente: 'Sofía Vargas',
          tratamiento: 'Endodoncia',
          fecha: new Date(),
          hora: '02:00 PM',
          odontologo: 'Dr. Juan Pérez'
        },
        {
          id: 4,
          paciente: 'Roberto Fernández',
          tratamiento: 'Blanqueamiento',
          fecha: new Date(),
          hora: '03:30 PM',
          odontologo: 'Dra. Ana Mora'
        }
      ],
      
      // Alertas de inventario
      alertasInventario: [
        {
          producto: 'Guantes de Látex (Caja)',
          stockActual: 5,
          stockMinimo: 10,
          urgencia: 'alta'
        },
        {
          producto: 'Anestesia Local (Ampolla)',
          stockActual: 15,
          stockMinimo: 20,
          urgencia: 'media'
        },
        {
          producto: 'Amalgama Dental',
          stockActual: 8,
          stockMinimo: 10,
          urgencia: 'baja'
        }
      ]
    };
    
    return of(estadisticas).pipe(delay(500));
  }
}