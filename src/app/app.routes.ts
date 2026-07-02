import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ReservasComponent } from './features/reservas/reservas.component';
import { EspaciosPageComponent } from './features/espacios/espacios-page.component';
import { PruebasComponent } from './features/pruebas/pruebas.component';
import { authGuard } from './core/auth.guard';

// ============================================================================
//  Definicion de rutas.
//   - /login    : publica (formulario de acceso)
//   - /pruebas  : publica (pruebas de la API en vivo; obtiene su propio token)
//   - /reservas : PROTEGIDA por authGuard (lista reservas del backend)
//   - /espacios : PROTEGIDA por authGuard (pantalla de gestion existente)
// ============================================================================
export const routes: Routes = [
  { path: '', redirectTo: 'reservas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'pruebas', component: PruebasComponent },
  { path: 'reservas', component: ReservasComponent, canActivate: [authGuard] },
  { path: 'espacios', component: EspaciosPageComponent, canActivate: [authGuard] },
  // Cualquier ruta desconocida vuelve al inicio
  { path: '**', redirectTo: 'reservas' }
];
