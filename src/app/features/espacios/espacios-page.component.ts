import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ListaEspaciosComponent } from '../../components/lista-espacios/lista-espacios.component';
import { ResumenReservaComponent } from '../../components/resumen-reserva/resumen-reserva.component';
import { PanelExplicacionComponent } from '../../components/panel-explicacion/panel-explicacion.component';
import { CodeCardComponent } from '../../components/code-card/code-card.component';
import { AuthService } from '../../core/auth.service';

// ============================================================================
//  Pagina de gestion de espacios (vista PROTEGIDA).
//  Reune los componentes existentes (lista de espacios + resumen) que antes
//  vivian directamente en AppComponent. Asi el codigo previo queda intacto.
// ============================================================================
@Component({
  selector: 'app-espacios-page',
  imports: [ListaEspaciosComponent, ResumenReservaComponent, RouterLink,
            PanelExplicacionComponent, CodeCardComponent],
  templateUrl: './espacios-page.component.html',
  styleUrl: './espacios-page.component.css'
})
export class EspaciosPageComponent {
  titulo = 'Sistema de Gestion de Reservas Academicas';

  private authService = inject(AuthService);
  private router = inject(Router);

  // --- Fragmentos de código para el panel explicativo -----------------------
  // Guard que protege esta ruta (resumen de core/auth.guard.ts)
  readonly codigoGuard = `// Bloquea la ruta si no hay token válido
export const authGuard: CanActivateFn = () => {
  if (authService.isAuthenticated()) {
    return true;                 // hay token vigente: pasa
  }
  router.navigate(['/login']);   // sin sesión: al login
  return false;                  // navegación bloqueada
};`;

  // Alta de reserva + disponibilidad por franja (resumen de reservas.store.ts)
  readonly codigoCrear = `// POST protegido: el interceptor pone el Bearer
crear(nueva) {
  return this.http
    .post<ReservaApi>(\`\${API_URL}/reservas\`, nueva)
    .pipe(tap((r) =>            // agrega a la lista compartida
      this._reservas.next([...this._reservas.value, r])));
}

// ¿El espacio ya está reservado en esa fecha y hora?
estaOcupado(espacio, fecha, hora) {
  return this._reservas.value.some((r) =>
    r.espacio === espacio &&
    r.fecha === fecha && r.hora === hora);
}`;

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
