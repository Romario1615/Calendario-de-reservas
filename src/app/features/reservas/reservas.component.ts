import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth.service';
import { ReservasStore } from '../../core/reservas.store';
import { ReservaApi } from '../../models/espacio.model';
import { PanelExplicacionComponent } from '../../components/panel-explicacion/panel-explicacion.component';
import { CodeCardComponent } from '../../components/code-card/code-card.component';

// Un dia dentro de la cuadricula del calendario
interface DiaCalendario {
  fecha: Date;
  iso: string;            // 'YYYY-MM-DD' para comparar con reserva.fecha
  delMes: boolean;        // pertenece al mes mostrado
  hoy: boolean;
  reservas: ReservaApi[]; // reservas de ese dia
}

// ============================================================================
//  Vista PROTEGIDA rediseñada: las reservas se muestran en un CALENDARIO
//  mensual y, al seleccionar una, su DETALLE aparece en el panel lateral.
//  La lista se obtiene del ReservasStore y se actualiza sola al crear reservas.
// ============================================================================
@Component({
  selector: 'app-reservas',
  imports: [CommonModule, RouterLink, PanelExplicacionComponent, CodeCardComponent],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly store = inject(ReservasStore);

  // Datos de la sesion (payload del JWT decodificado): usuario, rol y exp
  sesion = this.authService.getPayload();

  // Minutos que faltan para que expire el token (claim exp), visible en pantalla
  minutosRestantes: number | null = null;
  private timerExpiracion?: ReturnType<typeof setInterval>;

  // --- Fragmentos de código para el panel explicativo -----------------------
  // Validación centralizada del token (resumen de backend/authMiddleware.js)
  readonly codigoMiddleware = `// Caso 1: sin header Authorization -> 401
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'token_ausente' });
}

try {
  // Verifica FIRMA y EXPIRACIÓN en un solo paso
  req.usuario = jwt.verify(token, JWT_SECRET);
  next(); // token válido: la petición continúa
} catch (e) {
  const error = e.name === 'TokenExpiredError'
    ? 'token_expirado'   // Caso 2: exp vencido
    : 'token_invalido';  // Caso 3: firma mala / corrupto
  return res.status(401).json({ error });
}`;

  // Adjuntar el Bearer y reaccionar al 401 (resumen de core/auth.interceptor.ts)
  readonly codigoInterceptor = `// Clona cada petición agregando el token
const peticion = token
  ? req.clone({ setHeaders:
      { Authorization: \`Bearer \${token}\` } })
  : req;

return next(peticion).pipe(
  catchError((error) => {
    if (error.status === 401) {    // la API lo rechazó
      authService.logout();        // limpia el token
      router.navigate(['/login']); // vuelve al login
    }
    return throwError(() => error);
  })
);`;

  reservas: ReservaApi[] = [];
  seleccionada: ReservaApi | null = null;

  // Mes que muestra el calendario (primer dia del mes)
  mes = new Date();
  semanas: DiaCalendario[][] = [];

  private readonly hoyISO = this.fechaISO(new Date());
  readonly diasSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  private ajustadoMes = false;

  ngOnInit(): void {
    // Calcula cuanto falta para que expire el token y lo refresca cada 30 s
    this.actualizarExpiracion();
    this.timerExpiracion = setInterval(() => this.actualizarExpiracion(), 30000);

    // El store trae las reservas (GET /reservas, token via interceptor)
    this.store.cargar();

    // Nos suscribimos: cada vez que cambia la lista, reconstruimos el calendario
    this.store.reservas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => {
        this.reservas = lista;
        // La primera vez, posiciona el calendario en el mes de la reserva mas temprana
        if (!this.ajustadoMes && lista.length) {
          const minIso = lista.map((r) => r.fecha).sort()[0];
          this.mes = new Date(minIso + 'T00:00:00');
          this.ajustadoMes = true;
        }
        this.construirCalendario();
      });
  }

  // --- Construccion de la cuadricula (6 semanas x 7 dias) ---
  private construirCalendario(): void {
    const year = this.mes.getFullYear();
    const month = this.mes.getMonth();

    // Cuantos dias retroceder para empezar en lunes
    const primero = new Date(year, month, 1);
    const offset = (primero.getDay() + 6) % 7; // lunes = 0
    const cursor = new Date(year, month, 1 - offset);

    this.semanas = [];
    for (let s = 0; s < 6; s++) {
      const semana: DiaCalendario[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = this.fechaISO(cursor);
        semana.push({
          fecha: new Date(cursor),
          iso,
          delMes: cursor.getMonth() === month,
          hoy: iso === this.hoyISO,
          reservas: this.reservas.filter((r) => r.fecha === iso)
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      this.semanas.push(semana);
    }
  }

  // Convierte una fecha a 'YYYY-MM-DD' usando la zona local
  private fechaISO(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // Etiqueta del mes (ej. "julio de 2026")
  get etiquetaMes(): string {
    return this.mes.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  }

  mesAnterior(): void {
    this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() - 1, 1);
    this.construirCalendario();
  }

  mesSiguiente(): void {
    this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + 1, 1);
    this.construirCalendario();
  }

  irHoy(): void {
    this.mes = new Date();
    this.construirCalendario();
  }

  seleccionar(r: ReservaApi): void {
    this.seleccionada = r;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Recalcula los minutos restantes de vida del token (claim exp en segundos)
  private actualizarExpiracion(): void {
    const exp = this.sesion?.exp;
    if (!exp) {
      this.minutosRestantes = null;
      return;
    }
    const restanteMs = exp * 1000 - Date.now();
    this.minutosRestantes = Math.max(0, Math.ceil(restanteMs / 60000));
  }

  ngOnDestroy(): void {
    if (this.timerExpiracion) {
      clearInterval(this.timerExpiracion);
    }
  }
}
