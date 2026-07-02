import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// ============================================================================
//  AppComponent ahora es un "shell" minimo: solo aloja el <router-outlet>.
//  El contenido (login, reservas, espacios) lo deciden las rutas.
//  El layout de gestion que antes vivia aqui se movio a EspaciosPageComponent.
// ============================================================================
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {}
