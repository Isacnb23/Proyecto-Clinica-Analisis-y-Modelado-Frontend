export interface Notificacion {
  id: number;
  tipo?: string | null;
  titulo: string;
  mensaje: string;
  productoInventarioId?: number | null;
  productoNombre?: string | null;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string | null;
}