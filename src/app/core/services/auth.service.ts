import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // URL del API (cambiar cuando tengas el backend real)
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario desde localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login (simulado por ahora, luego conectamos con API real)
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // SIMULACIÓN - Reemplazar con llamada real al backend
    return of({
      user: {
        id: 1,
        nombre: 'Dr. Juan Pérez',
        email: credentials.email,
        cedula: '1-1234-5678',
        rol: {
          id: 1,
          nombre: 'Administrador',
          permisos: ['*']
        }
      },
      token: 'fake-jwt-token-' + Math.random()
    }).pipe(
      delay(1000), // Simular delay de red
      tap(response => {
        // Guardar usuario y token
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );

    // CÓDIGO REAL (descomentar cuando tengas el backend):
    // return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
    //   .pipe(
    //     tap(response => {
    //       localStorage.setItem('currentUser', JSON.stringify(response.user));
    //       localStorage.setItem('token', response.token);
    //       this.currentUserSubject.next(response.user);
    //     })
    //   );
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    
    // Si tiene permiso total (*)
    if (user.rol.permisos.includes('*')) return true;
    
    // Verificar permiso específico
    return user.rol.permisos.includes(permission);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}