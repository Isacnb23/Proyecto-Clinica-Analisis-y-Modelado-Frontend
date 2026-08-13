import { Pipe, PipeTransform } from '@angular/core';
import { formatCRC } from '../../core/utils/currency.util';

@Pipe({
  name: 'crc',
  standalone: true
})
export class CrcCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatCRC(value);
  }
}
