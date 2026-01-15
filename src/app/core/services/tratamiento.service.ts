import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Tratamiento, TratamientoFormData, CategoriaTratamiento } from '../models/tratamiento.model';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {
  private tratamientosSubject = new BehaviorSubject<Tratamiento[]>(this.getTratamientosMock());
  public tratamientos$ = this.tratamientosSubject.asObservable();

  constructor() {}

  // Obtener todos los tratamientos
  getTratamientos(): Observable<Tratamiento[]> {
    return this.tratamientos$.pipe(delay(500));
  }

  // Obtener tratamiento por ID
  getTratamientoById(id: number): Observable<Tratamiento | undefined> {
    return this.tratamientos$.pipe(
      map(tratamientos => tratamientos.find(t => t.id === id))
    );
  }

  // Obtener tratamientos por categoría
  getTratamientosByCategoria(categoriaId: number): Observable<Tratamiento[]> {
    return this.tratamientos$.pipe(
      map(tratamientos => tratamientos.filter(t => t.categoriaId === categoriaId))
    );
  }

  // Buscar tratamientos
  buscarTratamientos(termino: string): Observable<Tratamiento[]> {
    return this.tratamientos$.pipe(
      map(tratamientos => 
        tratamientos.filter(t => 
          t.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          t.codigo.toLowerCase().includes(termino.toLowerCase()) ||
          t.descripcion.toLowerCase().includes(termino.toLowerCase())
        )
      ),
      delay(300)
    );
  }

  // Crear tratamiento
  crearTratamiento(data: TratamientoFormData): Observable<Tratamiento> {
    const tratamientos = this.tratamientosSubject.value;
    const nuevoId = Math.max(...tratamientos.map(t => t.id), 0) + 1;

    const categoria = this.getCategoriaNombre(data.categoriaId);

    const nuevoTratamiento: Tratamiento = {
      id: nuevoId,
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoriaId: data.categoriaId,
      categoriaNombre: categoria,
      duracionEstimada: data.duracionEstimada,
      costo: data.costo,
      requiereAutorizacion: data.requiereAutorizacion,
      observaciones: data.observaciones,
      activo: true,
      createdAt: new Date()
    };

    const nuevaLista = [...tratamientos, nuevoTratamiento];
    this.tratamientosSubject.next(nuevaLista);

    return of(nuevoTratamiento).pipe(delay(500));
  }

  // Actualizar tratamiento
  actualizarTratamiento(id: number, data: TratamientoFormData): Observable<Tratamiento> {
    const tratamientos = this.tratamientosSubject.value;
    const index = tratamientos.findIndex(t => t.id === id);

    if (index !== -1) {
      const categoria = this.getCategoriaNombre(data.categoriaId);

      const tratamientoActualizado: Tratamiento = {
        ...tratamientos[index],
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId,
        categoriaNombre: categoria,
        duracionEstimada: data.duracionEstimada,
        costo: data.costo,
        requiereAutorizacion: data.requiereAutorizacion,
        observaciones: data.observaciones,
        updatedAt: new Date()
      };

      const nuevaLista = [...tratamientos];
      nuevaLista[index] = tratamientoActualizado;
      this.tratamientosSubject.next(nuevaLista);

      return of(tratamientoActualizado).pipe(delay(500));
    }

    throw new Error('Tratamiento no encontrado');
  }

  // Eliminar (desactivar) tratamiento
  eliminarTratamiento(id: number): Observable<boolean> {
    const tratamientos = this.tratamientosSubject.value;
    const index = tratamientos.findIndex(t => t.id === id);

    if (index !== -1) {
      const nuevaLista = [...tratamientos];
      nuevaLista[index] = { ...nuevaLista[index], activo: false };
      this.tratamientosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Activar tratamiento
  activarTratamiento(id: number): Observable<boolean> {
    const tratamientos = this.tratamientosSubject.value;
    const index = tratamientos.findIndex(t => t.id === id);

    if (index !== -1) {
      const nuevaLista = [...tratamientos];
      nuevaLista[index] = { ...nuevaLista[index], activo: true };
      this.tratamientosSubject.next(nuevaLista);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Obtener categorías
  getCategorias(): Observable<CategoriaTratamiento[]> {
    return of([
      { id: 1, nombre: 'Odontología General', descripcion: 'Tratamientos generales', color: '#667eea', icono: 'medical_services', activo: true },
      { id: 2, nombre: 'Ortodoncia', descripcion: 'Corrección de dientes', color: '#f093fb', icono: 'straighten', activo: true },
      { id: 3, nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', color: '#4facfe', icono: 'healing', activo: true },
      { id: 4, nombre: 'Periodoncia', descripcion: 'Tratamiento de encías', color: '#43e97b', icono: 'spa', activo: true },
      { id: 5, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos', color: '#fa709a', icono: 'local_hospital', activo: true },
      { id: 6, nombre: 'Estética Dental', descripcion: 'Mejora estética', color: '#fee140', icono: 'star', activo: true },
      { id: 7, nombre: 'Prótesis', descripcion: 'Reemplazo de dientes', color: '#30cfd0', icono: 'settings', activo: true }
    ]).pipe(delay(300));
  }

  // Helper
  private getCategoriaNombre(id: number): string {
    const categorias = ['Odontología General', 'Ortodoncia', 'Endodoncia', 'Periodoncia', 'Cirugía', 'Estética Dental', 'Prótesis'];
    return categorias[id - 1] || 'Sin categoría';
  }

  // Datos mock
  private getTratamientosMock(): Tratamiento[] {
    return [
      {
        id: 1,
        codigo: 'OG-001',
        nombre: 'Limpieza Dental',
        descripcion: 'Profilaxis dental completa con fluorización',
        categoriaId: 1,
        categoriaNombre: 'Odontología General',
        duracionEstimada: 30,
        costo: 25000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        codigo: 'EST-001',
        nombre: 'Blanqueamiento Dental',
        descripcion: 'Blanqueamiento dental profesional con luz LED',
        categoriaId: 6,
        categoriaNombre: 'Estética Dental',
        duracionEstimada: 60,
        costo: 120000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-16')
      },
      {
        id: 3,
        codigo: 'ORT-001',
        nombre: 'Ortodoncia - Consulta Inicial',
        descripcion: 'Primera consulta de ortodoncia con análisis completo',
        categoriaId: 2,
        categoriaNombre: 'Ortodoncia',
        duracionEstimada: 45,
        costo: 15000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-17')
      },
      {
        id: 4,
        codigo: 'ORT-002',
        nombre: 'Ortodoncia - Control Mensual',
        descripcion: 'Control y ajuste mensual de ortodoncia',
        categoriaId: 2,
        categoriaNombre: 'Ortodoncia',
        duracionEstimada: 30,
        costo: 35000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-18')
      },
      {
        id: 5,
        codigo: 'END-001',
        nombre: 'Endodoncia',
        descripcion: 'Tratamiento de conducto radicular completo',
        categoriaId: 3,
        categoriaNombre: 'Endodoncia',
        duracionEstimada: 90,
        costo: 180000,
        requiereAutorizacion: true,
        activo: true,
        createdAt: new Date('2024-01-19')
      },
      {
        id: 6,
        codigo: 'CIR-001',
        nombre: 'Extracción Simple',
        descripcion: 'Extracción de pieza dental simple',
        categoriaId: 5,
        categoriaNombre: 'Cirugía',
        duracionEstimada: 30,
        costo: 35000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-20')
      },
      {
        id: 7,
        codigo: 'PROT-001',
        nombre: 'Corona Dental',
        descripcion: 'Colocación de corona de porcelana',
        categoriaId: 7,
        categoriaNombre: 'Prótesis',
        duracionEstimada: 60,
        costo: 250000,
        requiereAutorizacion: true,
        activo: true,
        createdAt: new Date('2024-01-21')
      },
      {
        id: 8,
        codigo: 'PROT-002',
        nombre: 'Implante Dental',
        descripcion: 'Colocación de implante dental de titanio',
        categoriaId: 7,
        categoriaNombre: 'Prótesis',
        duracionEstimada: 120,
        costo: 800000,
        requiereAutorizacion: true,
        activo: true,
        createdAt: new Date('2024-01-22')
      },
      {
        id: 9,
        codigo: 'OG-002',
        nombre: 'Resina Dental',
        descripcion: 'Restauración con resina compuesta',
        categoriaId: 1,
        categoriaNombre: 'Odontología General',
        duracionEstimada: 45,
        costo: 45000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-23')
      },
      {
        id: 10,
        codigo: 'PER-001',
        nombre: 'Tratamiento Periodontal',
        descripcion: 'Limpieza profunda y tratamiento de encías',
        categoriaId: 4,
        categoriaNombre: 'Periodoncia',
        duracionEstimada: 60,
        costo: 85000,
        requiereAutorizacion: false,
        activo: true,
        createdAt: new Date('2024-01-24')
      },
      {
        id: 11,
        codigo: 'EST-002',
        nombre: 'Carillas de Porcelana',
        descripcion: 'Colocación de carillas estéticas de porcelana',
        categoriaId: 6,
        categoriaNombre: 'Estética Dental',
        duracionEstimada: 90,
        costo: 350000,
        requiereAutorizacion: true,
        activo: true,
        createdAt: new Date('2024-01-25')
      },
      {
        id: 12,
        codigo: 'CIR-002',
        nombre: 'Extracción de Cordales',
        descripcion: 'Extracción quirúrgica de muelas del juicio',
        categoriaId: 5,
        categoriaNombre: 'Cirugía',
        duracionEstimada: 60,
        costo: 120000,
        requiereAutorizacion: true,
        observaciones: 'Requiere valoración previa',
        activo: true,
        createdAt: new Date('2024-01-26')
      }
    ];
  }
}