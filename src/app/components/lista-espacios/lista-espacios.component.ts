import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspacioCardComponent } from '../espacio-card/espacio-card.component';
import { ReservaFormComponent } from '../reserva-form/reserva-form.component';
import { Espacio } from '../../models/espacio.model';
import { ReservasStore } from '../../core/reservas.store';

@Component({
  selector: 'app-lista-espacios',
  imports: [CommonModule, EspacioCardComponent, ReservaFormComponent],
  templateUrl: './lista-espacios.component.html',
  styleUrl: './lista-espacios.component.css'
})
export class ListaEspaciosComponent implements OnInit {

  // Store de reservas: se carga para poder comprobar disponibilidad por franja
  private store = inject(ReservasStore);

  ngOnInit(): void {
    // Asegura que la lista de reservas esté disponible para el chequeo del formulario
    this.store.cargar();
  }

  // Espacio actualmente seleccionado para reservar
  espacioSeleccionado: Espacio | null = null;

  // Lista de espacios académicos disponibles
  espacios: Espacio[] = [
    {
      id: 1,
      nombre: 'Aula Magna A-101',
      tipo: 'Aula',
      capacidad: 40,
      disponible: true,
      ubicacion: 'Bloque A, Piso 1',
      imagen: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      nombre: 'Laboratorio de Computación LC-201',
      tipo: 'Laboratorio',
      capacidad: 30,
      disponible: true,
      ubicacion: 'Bloque C, Piso 2',
      imagen: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop'
    },
    {
      id: 3,
      nombre: 'Auditorio Principal',
      tipo: 'Auditorio',
      capacidad: 200,
      disponible: true,
      ubicacion: 'Edificio Central',
      imagen: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=200&fit=crop'
    },
    {
      id: 4,
      nombre: 'Sala de Conferencias B-305',
      tipo: 'Sala de Conferencias',
      capacidad: 60,
      disponible: true,
      ubicacion: 'Bloque B, Piso 3',
      imagen: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop'
    },
    // Nuevo espacio académico agregado (tarea a)
    {
      id: 5,
      nombre: 'Laboratorio de Redes LR-102',
      tipo: 'Laboratorio',
      capacidad: 25,
      disponible: true,
      ubicacion: 'Bloque D, Piso 1',
      imagen: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop'
    }
  ];

  // Total de espacios académicos
  get totalEspacios(): number {
    return this.espacios.length;
  }

  // Recibe el evento del hijo (espacio-card) con el espacio seleccionado
  onEspacioSeleccionado(espacio: Espacio): void {
    this.espacioSeleccionado = espacio;
  }

  // Nueva lógica: el espacio NO se marca como no disponible.
  // La disponibilidad se calcula por fecha + hora en el formulario.
  // Aquí solo cerramos el modal tras guardar.
  onReservaGuardada(_espacio: Espacio): void {
    this.espacioSeleccionado = null;
  }

  // Cierra el modal al hacer click en el overlay (fuera de la caja)
  cerrarModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.espacioSeleccionado = null;
    }
  }
}
