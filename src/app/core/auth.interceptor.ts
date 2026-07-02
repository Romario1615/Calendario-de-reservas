import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// ============================================================================
//  Interceptor funcional de autenticacion.
//  Centraliza DOS responsabilidades para que ningun componente repita logica:
//   1) Adjunta automaticamente "Authorization: Bearer <token>" a cada peticion.
//   2) Si el backend responde 401, limpia el token y redirige al login.
// ============================================================================
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // 1) Si hay token, clonamos la peticion agregando el header Authorization.
  //    (Las peticiones son inmutables: hay que clonar para modificarlas).
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // 2) Manejo de la respuesta: si llega un 401, cerramos sesion y vamos al login.
  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
