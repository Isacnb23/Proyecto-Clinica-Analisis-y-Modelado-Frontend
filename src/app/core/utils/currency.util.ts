/**
 * Formatea un monto en colones (₡) de forma consistente en toda la app:
 * símbolo, separador de miles con punto, sin decimales.
 * No se usa Intl.NumberFormat/toLocaleString aquí porque su salida para
 * 'es-CR' varía entre navegador y Node (space vs coma como separador),
 * lo que generaba formatos distintos en cada pantalla.
 */
export function formatCRC(value: number | null | undefined): string {
  const n = Math.round(value ?? 0);
  const sign = n < 0 ? '-' : '';
  const digits = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `₡${sign}${digits}`;
}
