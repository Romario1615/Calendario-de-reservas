import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Espacio } from '../../models/espacio.model';

@Component({
  selector: 'app-espacio-card',
  imports: [CommonModule],
  templateUrl: './espacio-card.component.html',
  styleUrl: './espacio-card.component.css'
})
export class EspacioCardComponent {

  // @Input: recibe el objeto espacio desde el componente padre (lista-espacios)
  @Input() espacio!: Espacio;

  // @Output: emite el espacio seleccionado hacia el componente padre
  @Output() espacioSeleccionado = new EventEmitter<Espacio>();

  // Bandera para mostrar un fallback si la imagen no carga
  imagenFallo = false;

  // Emite el evento con el espacio actual al componente padre
  seleccionar(): void {
    this.espacioSeleccionado.emit(this.espacio);
  }

  // Si la imagen no carga, mostramos un marcador en su lugar
  onImagenError(): void {
    this.imagenFallo = true;
  }
}
