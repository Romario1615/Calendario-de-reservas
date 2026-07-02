import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reserva } from '../models/espacio.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaServiceService {

  // BehaviorSubject: mantiene el último valor emitido y lo entrega a nuevos suscriptores
  // Valor inicial null indica que no hay reserva activa
  private reservaSubject = new BehaviorSubject<Reserva | null>(null);

  // Observable público: los componentes se suscriben para recibir actualizaciones
  reserva$: Observable<Reserva | null> = this.reservaSubject.asObservable();

  // Registra una nueva reserva y notifica a todos los suscriptores
  registrarReserva(reserva: Reserva): void {
    this.reservaSubject.next(reserva);
  }

  // Limpia la reserva actual, emitiendo null a todos los suscriptores
  limpiarReserva(): void {
    this.reservaSubject.next(null);
  }
}
