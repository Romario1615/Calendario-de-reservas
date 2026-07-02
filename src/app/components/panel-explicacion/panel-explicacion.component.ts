import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================================================
//  Panel de ayuda contextual (heurística 10 de Nielsen: ayuda y documentación).
//  Vive al lado izquierdo de cada pantalla y explica cómo funciona, con texto
//  y fragmentos de código. Es colapsable (heurística 8: diseño minimalista,
//  el usuario decide cuánto ver) y consistente en toda la app (heurística 4).
// ============================================================================
@Component({
  selector: 'app-panel-explicacion',
  imports: [CommonModule],
  templateUrl: './panel-explicacion.component.html',
  styleUrl: './panel-explicacion.component.css'
})
export class PanelExplicacionComponent {
  // Título del panel, propio de cada pantalla
  @Input() titulo = 'Cómo funciona';

  // Abierto por defecto para que la explicación sea visible al presentar
  abierto = true;
}
