import { Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Reserva } from '../../models/espacio.model';
import { ReservaServiceService } from '../../services/reserva-service.service';

@Component({
  selector: 'app-resumen-reserva',
  // AsyncPipe: gestiona automáticamente la suscripción y desuscripción del Observable
  imports: [CommonModule, AsyncPipe],
  templateUrl: './resumen-reserva.component.html',
  styleUrl: './resumen-reserva.component.css'
})
export class ResumenReservaComponent {

  // Observable: flujo reactivo de datos que emite la reserva actual
  // Se suscribe en el template con el pipe async
  reserva$: Observable<Reserva | null>;

  constructor(private reservaService: ReservaServiceService) {
    // Se obtiene el observable del servicio para escuchar cambios en tiempo real
    this.reserva$ = this.reservaService.reserva$;
  }
}
