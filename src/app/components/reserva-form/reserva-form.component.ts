import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Espacio, Reserva } from '../../models/espacio.model';
import { ReservaServiceService } from '../../services/reserva-service.service';
import { ReservasStore } from '../../core/reservas.store';

@Component({
  selector: 'app-reserva-form',
  // FormsModule habilita [(ngModel)] para data binding bidireccional
  imports: [FormsModule, CommonModule],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.css'
})
export class ReservaFormComponent {

  // @Input: recibe el espacio seleccionado desde lista-espacios
  @Input() espacio!: Espacio;

  // @Output: emite el espacio reservado para que el padre lo marque como no disponible
  @Output() formularioCerrado = new EventEmitter<Espacio>();

  // Campos del formulario vinculados con [(ngModel)]
  responsable: string = '';
  fecha: string = '';
  hora: string = '';
  carrera: string = '';   // Campo adicional: carrera solicitante (tarea d)

  // Mensaje de alerta para validaciones
  mensajeAlerta: string = '';

  // Indica si se está enviando la reserva (evita doble envío)
  enviando = false;

  constructor(
    private reservaService: ReservaServiceService,
    private reservasStore: ReservasStore
  ) {}

  // --- Disponibilidad por franja (nueva lógica) ---
  // 'incompleto' = falta fecha u hora; 'libre' = se puede reservar;
  // 'ocupado' = ese espacio ya está reservado en esa fecha y hora.
  get disponibilidad(): 'incompleto' | 'libre' | 'ocupado' {
    if (!this.fecha || !this.hora) {
      return 'incompleto';
    }
    return this.reservasStore.estaOcupado(this.espacio.nombre, this.fecha, this.hora)
      ? 'ocupado'
      : 'libre';
  }

  // Envía la reserva al servicio si todas las validaciones pasan (tarea g)
  guardarReserva(): void {
    // Validación: responsable debe tener al menos 3 caracteres
    if (this.responsable.trim().length < 3) {
      this.mensajeAlerta = 'El responsable debe tener al menos 3 caracteres.';
      return;
    }

    // Validación: fecha no puede estar vacía
    if (!this.fecha) {
      this.mensajeAlerta = 'La fecha es obligatoria.';
      return;
    }

    // Validación: hora no puede estar vacía
    if (!this.hora) {
      this.mensajeAlerta = 'La hora es obligatoria.';
      return;
    }

    // Validación: carrera no puede estar vacía
    if (!this.carrera.trim()) {
      this.mensajeAlerta = 'La carrera solicitante es obligatoria.';
      return;
    }

    // Validación de disponibilidad: el espacio no puede estar ocupado en esa franja
    if (this.disponibilidad === 'ocupado') {
      this.mensajeAlerta = 'Ese espacio ya está reservado en esa fecha y hora. Elige otra franja.';
      return;
    }

    this.mensajeAlerta = '';
    this.enviando = true;

    // Construye el objeto Reserva (para el resumen lateral)
    const reserva: Reserva = {
      espacio: this.espacio,
      responsable: this.responsable.trim(),
      fecha: this.fecha,
      hora: this.hora,
      carrera: this.carrera.trim()
    };

    // Crea la reserva en el backend (POST /reservas protegido) y la agrega a la
    // lista compartida. Asi aparece en el calendario de la vista de reservas.
    this.reservasStore.crear({
      espacio: this.espacio.nombre,
      responsable: this.responsable.trim(),
      fecha: this.fecha,
      hora: this.hora,
      carrera: this.carrera.trim()
    }).subscribe({
      next: () => {
        this.reservaService.registrarReserva(reserva); // actualiza el resumen
        this.formularioCerrado.emit(this.espacio);     // cierra el modal
      },
      error: () => {
        this.enviando = false;
        this.mensajeAlerta = 'No se pudo guardar la reserva. Intenta de nuevo.';
      }
    });
  }

  // Limpia todos los campos del formulario (tarea f)
  limpiarFormulario(): void {
    this.responsable = '';
    this.fecha = '';
    this.hora = '';
    this.carrera = '';
    this.mensajeAlerta = '';
    this.reservaService.limpiarReserva();
  }
}
