import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// ============================================================================
//  Route Guard (CanActivate) funcional.
//  Protege las rutas: si NO hay sesion valida, redirige al login.
// ============================================================================
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // hay token valido -> deja entrar
  }

  // Sin token valido -> redirige al login y bloquea la navegacion.
  router.navigate(['/login']);
  return false;
};
