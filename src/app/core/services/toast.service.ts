import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title = 'Éxito'): void {
    this.toastr.success(message, title);
  }

  error(message: string, title = 'Error'): void {
    this.toastr.error(message, title);
  }

  warning(message: string, title = 'Atención'): void {
    this.toastr.warning(message, title);
  }

  info(message: string, title = 'Información'): void {
    this.toastr.info(message, title);
  }

  httpError(error: any, fallback = 'Ocurrió un error inesperado'): void {
    const message =
      error?.error?.message ||
      error?.error?.title ||
      error?.message ||
      fallback;

    this.toastr.error(message, 'Error');
  }
}