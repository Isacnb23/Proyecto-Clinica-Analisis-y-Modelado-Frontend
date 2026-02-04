import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@clinica.com', [Validators.required, Validators.email]],
      password: ['Admin123*', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Por favor complete todos los campos correctamente', 'Error');
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Response recibida:', response);

        // Validar respuesta
        if (response.success && response.user) {
          this.toastr.success(
            `Bienvenido ${response.user.email} (${response.user.rol})`, 
            '¡Éxito!'
          );
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error(response.message || 'Error en el login', 'Error');
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error completo:', err);
        
        this.loading = false;

        // Extraer mensaje de error
        let errorMessage = 'Credenciales incorrectas';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.Message) {
          errorMessage = err.error.Message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.toastr.error(errorMessage, 'Error de Autenticación');
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}