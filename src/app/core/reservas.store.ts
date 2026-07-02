import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from './api';
import { ReservaApi } from '../models/espacio.model';

// ============================================================================
//  Store (servicio singleton) que mantiene la LISTA de reservas en el frontend.
//  - cargar(): trae las reservas del backend (GET /reservas) una sola vez.
//  - crear(): crea una reserva (POST /reservas) y la agrega a la lista.
//  La vista de calendario se suscribe a reservas$ y se actualiza sola cada vez
//  que se crea una reserva nueva.
// ============================================================================
@Injectable({ providedIn: 'root' })
export class ReservasStore {

  private http = inject(HttpClient);

  // Fuente de verdad de la lista de reservas
  private _reservas = new BehaviorSubject<ReservaApi[]>([]);
  reservas$ = this._reservas.asObservable();

  // Estado de la carga inicial (para mostrar cargando/error en la vista)
  cargando = false;
  error = false;
  private cargado = false;

  // Carga las reservas del backend (solo la primera vez)
  cargar(): void {
    if (this.cargado) {
      return;
    }
    this.cargando = true;
    this.error = false;
    this.http.get<ReservaApi[]>(`${API_URL}/reservas`).subscribe({
      next: (data) => {
        this._reservas.next(data);
        this.cargado = true;
        this.cargando = false;
      },
      error: () => {
        // Si fuera 401, el interceptor ya habria redirigido al login.
        this.cargando = false;
        this.error = true;
      }
    });
  }

  // ¿Ya existe una reserva para ese espacio en esa fecha y hora?
  // (Nueva lógica de disponibilidad: por franja, no un estado fijo del espacio).
  estaOcupado(espacio: string, fecha: string, hora: string): boolean {
    return this._reservas.value.some(
      (r) => r.espacio === espacio && r.fecha === fecha && r.hora === hora
    );
  }

  // Crea una reserva en el backend y, si tiene exito, la agrega a la lista.
  crear(nueva: Omit<ReservaApi, 'id'>): Observable<ReservaApi> {
    return this.http.post<ReservaApi>(`${API_URL}/reservas`, nueva).pipe(
      tap((creada) => {
        this._reservas.next([...this._reservas.value, creada]);
      })
    );
  }
}
