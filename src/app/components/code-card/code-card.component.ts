import { Component, Input } from '@angular/core';

// ============================================================================
//  Tarjeta de código estilo editor: muestra un fragmento relevante del
//  proyecto con su archivo de origen. Los comentarios dentro del propio
//  fragmento explican qué hace cada parte.
// ============================================================================
@Component({
  selector: 'app-code-card',
  imports: [],
  templateUrl: './code-card.component.html',
  styleUrl: './code-card.component.css'
})
export class CodeCardComponent {
  // Ruta del archivo del que proviene el fragmento
  @Input() archivo = '';
  // Fragmento de código (con comentarios explicativos)
  @Input() codigo = '';
}
