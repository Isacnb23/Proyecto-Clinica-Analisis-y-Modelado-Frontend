# Clínica Dental PCA — Contexto del Proyecto

## Stack técnico
- **Frontend**: Angular 19 (standalone components), Angular Material, TypeScript, SCSS, Tailwind CSS v3
- **Backend**: ASP.NET Core 9 Web API, Entity Framework Core, BCrypt.Net, JWT Bearer
- **Base de datos**: PostgreSQL 15 (Railway), EnsureCreated() con seed automático
- **Deploy**: Frontend en Vercel, Backend + DB en Railway (Docker)
- **Auth**: JWT con 4 roles: `admin`, `odontologo`, `recepcionista`, `asistente`

## Estructura del repositorio

### Frontend (`Proyecto-Clinica-Analisis-y-Modelado-Frontend/`)
```
src/app/
├── core/
│   ├── guards/         auth.guard.ts, role.guard.ts
│   ├── interceptors/   auth.interceptor.ts
│   ├── models/         paciente.model.ts, cita.model.ts, inventario.model.ts, user.model.ts ...
│   └── services/       auth.service.ts, paciente.service.ts, cita.service.ts,
│                       empleado.service.ts, tratamiento.service.ts, facturacion.service.ts,
│                       inventario.service.ts, roles.service.ts, estadistica.service.ts
├── features/
│   ├── auth/           login.component
│   ├── dashboard/      dashboard.component
│   ├── pacientes/      pacientes.component, paciente-form, paciente-detalle
│   ├── empleados/      empleados.component, empleado-form
│   ├── citas/          citas.component (calendario + lista), cita-form, cita-detalle
│   ├── horarios/       horarios.component
│   ├── tratamientos/   tratamientos.component, tratamiento-form
│   ├── inventario/     inventario.component, inventario-form
│   ├── facturacion/    facturacion.component (usa /api/Tratamientos, NO /api/Facturas)
│   ├── roles/          roles.component (permisos por rol + crear usuarios)
│   ├── reportes/       reportes.component
│   └── perfil/         perfil-config-ayuda.component
├── layouts/
│   └── main-layout/    main-layout.component (sidebar dinámico por rol)
├── shared/
│   └── notification-bell/  notificaciones de stock bajo
├── app.routes.ts       rutas con authGuard + roleGuard
└── app.config.ts       NoReuseStrategy registrado
```

### Backend (`Proyecto-Clinica-Analisis-y-Modelado-Backend/ClinicaDentalPCA.API/`)
```
Controllers/
├── AuthController.cs          POST /api/Auth/login
├── PacientesController.cs     [Authorize] CRUD + activar/desactivar
├── EmpleadosController.cs     [Authorize] GET all; [Authorize(admin)] mutaciones
├── CitasController.cs         [Authorize] CRUD completo
├── TratamientosController.cs  [Authorize] CRUD + pagos
├── InventarioController.cs    [Authorize] productos + categorías + movimientos
├── PagosController.cs         [Authorize] registro de pagos
├── NotificacionesController.cs
├── HorariosController.cs
├── RolesController.cs         [Authorize(admin)]
└── UsuariosController.cs      [Authorize(admin)] GET + POST + PATCH desactivar

Services/
├── AuthService.cs             genera JWT con ClaimTypes.Role
├── PacienteService.cs         implementa IPacienteService
├── PagosService.cs            actualiza MontoPagado y Saldo manualmente tras cada pago
└── ...

Models/
├── Usuario.cs, Rol.cs, Paciente.cs, Empleado.cs, Cita.cs
├── Tratamiento.cs             tiene MontoPagado y Saldo como campos reales (no computed)
└── ProductoInventario.cs      tiene PrecioUnitario (backend) ← frontend usa costoUnitario

Data/
└── AppDbContext.cs            EnsureCreated() en startup, seed de roles y admin
```

## Configuración crítica

### Program.cs — JWT (NO CAMBIAR)
```csharp
options.MapInboundClaims = false;
// En TokenValidationParameters:
RoleClaimType = ClaimTypes.Role
```
Esto es obligatorio. Sin esto todos los roles non-admin reciben 403.

### Program.cs — PostgreSQL
```csharp
// Railway provee URL formato postgresql://user:pass@host/db
// Se parsea automáticamente en Program.cs antes de pasar a UseNpgsql
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
```
**IMPORTANTE**: Siempre usar `DateTime.UtcNow`, nunca `DateTime.Now` — PostgreSQL rechaza fechas Kind=Local.

### Program.cs — CORS
```csharp
policy.SetIsOriginAllowed(origin =>
    origin == "http://localhost:4200" ||
    origin == "https://localhost:4200" ||
    origin.EndsWith(".vercel.app")
)
```

### environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5080/api'  // local
};
// environment.production.ts apunta a Railway
```

## Problemas conocidos y sus soluciones

| Problema | Causa | Solución |
|---|---|---|
| 403 para roles non-admin | JWT RoleClaimType no configurado | `MapInboundClaims=false` + `RoleClaimType=ClaimTypes.Role` |
| DateTime rechazado por Postgres | `DateTime.Now` es Kind=Local | Siempre `DateTime.UtcNow` |
| Citas no aparecen en calendario | UTC-6 desplaza fecha al día anterior | Comparar `fecha.substring(0,10)` sin convertir timezone |
| NaN en costo de inventario | Backend: `precioUnitario`, Frontend espera: `costoUnitario` | Normalizar en carga: `costoUnitario = p.precioUnitario ?? p.costoUnitario ?? 0` |
| MontoPagado no actualiza | Faltaba trigger SQL (inexistente en Postgres) | PagosService suma pagos y actualiza manualmente |
| Bundle size Vercel | SCSS supera límites Angular | Aumentar budgets en `angular.json` |
| CORS bloqueado | Solo localhost en origins | `SetIsOriginAllowed` con `*.vercel.app` |

## Modelos clave

### TratamientoResponseDTO
```
id, pacienteNombre, empleadoNombre, nombre, descripcion, categoriaId,
estadoId, fechaInicio, costoTotal, montoPagado, saldo
```

### ProductoInventarioResponseDTO
```
id, categoriaInventarioId, categoriaNombre, codigo, nombre,
stockActual, stockMinimo, precioUnitario, activo, stockBajo (computed)
```

### CitaResponseDTO
```
id, pacienteNombre, pacienteApellidos, empleadoNombre,
fecha (ISO UTC string), horaInicio (TimeSpan), estado
```

## Permisos por rol (roles.service.ts)
```
admin        → todo
odontologo   → dashboard.ver, pacientes.ver, citas.ver/crear, tratamientos.ver/crear
recepcionista→ dashboard.ver, pacientes.ver/crear, citas.ver/crear, facturacion.ver
asistente    → dashboard.ver, pacientes.ver, citas.ver, inventario.ver, tratamientos.ver
```

## Credenciales de prueba (seed automático)
```
Email:    admin@clinica.com
Password: Admin123*
Rol:      admin
```

## URLs de producción
```
Frontend: https://proyecto-clinica-analisis-y-modelado.vercel.app
Backend:  https://proyecto-clinica-analisis-y-modelado-backend-production.up.railway.app
```

## Comandos útiles

### Frontend
```bash
cd Proyecto-Clinica-Analisis-y-Modelado-Frontend
npm install
ng serve                    # desarrollo local puerto 4200
ng build --configuration production
```

### Backend
```bash
cd Proyecto-Clinica-Analisis-y-Modelado-Backend
dotnet run                  # puerto 5080 por defecto
# La DB se crea automáticamente con EnsureCreated() al arrancar
# El seed crea roles y usuario admin si no existen
```

### Deploy
```bash
# Backend → Railway lo toma automáticamente del push a main
git add . && git commit -m "mensaje" && git push origin main

# Frontend → Vercel también auto-deploya desde main del repo frontend
```

## Notas para Claude Code
- El frontend usa `NoReuseStrategy` — los componentes se recrean al navegar. No uses estrategias de caché de rutas.
- La facturación usa `/api/Tratamientos`, NO `/api/Facturas` (ese endpoint no existe).
- El sidebar (`visibleMenuItems`) es un getter que lee `getRolePermissions()` del localStorage. Se actualiza disparando `window.dispatchEvent(new Event('storage'))`.
- Tailwind v3 — no actualizar a v4, rompe PostCSS.
- Angular standalone components — no hay NgModules. Cada componente declara sus imports directamente.
- `getProductosBajoStock()` usa query param: `/api/Inventario/productos?stockBajo=true`, no un endpoint separado.
