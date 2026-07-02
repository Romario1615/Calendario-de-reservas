import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../core/api';
import { PanelExplicacionComponent } from '../../components/panel-explicacion/panel-explicacion.component';
import { CodeCardComponent } from '../../components/code-card/code-card.component';

// Una prueba de la API (espejo de la coleccion de Postman)
interface PruebaApi {
  n: number;
  titulo: string;
  metodo: 'POST' | 'GET';
  ruta: string;
  auth: 'ninguno' | 'valido' | 'invalido';  // que header Authorization se envia
  esperado: number;                          // status HTTP esperado
  descripcion: string;
  // Resultado de la ejecucion en vivo
  estado: 'pendiente' | 'ejecutando' | 'exito' | 'fallo';
  status?: number;
  cuerpo?: string;
  headerEnviado?: string;
}

// ============================================================================
//  Pantalla de PRUEBAS EN VIVO (Funcionalidad 5).
//  Ejecuta contra el backend real las mismas 4 requests de la coleccion
//  postman/JWT-Reservas.postman_collection.json y muestra status, respuesta
//  y si el resultado coincide con lo esperado (PASS/FAIL).
//
//  IMPORTANTE: usa fetch NATIVO (no HttpClient) a proposito, para esquivar
//  el interceptor: asi se ven las respuestas crudas de la API (401 incluidos)
//  sin que la app limpie el token ni redirija al login.
// ============================================================================
@Component({
  selector: 'app-pruebas',
  imports: [CommonModule, RouterLink, PanelExplicacionComponent, CodeCardComponent],
  templateUrl: './pruebas.component.html',
  styleUrl: './pruebas.component.css'
})
export class PruebasComponent {

  // Token obtenido por la prueba 1 (se reutiliza en la prueba 2, como {{token}})
  token: string | null = null;

  ejecutandoTodas = false;

  pruebas: PruebaApi[] = [
    {
      n: 1, titulo: 'Obtención del token', metodo: 'POST', ruta: '/login',
      auth: 'ninguno', esperado: 200,
      descripcion: 'Envía las credenciales y recibe { "token": "..." }. El token se guarda para la prueba 2 (igual que la variable {{token}} en Postman).',
      estado: 'pendiente'
    },
    {
      n: 2, titulo: 'Endpoint protegido con token válido', metodo: 'GET', ruta: '/reservas',
      auth: 'valido', esperado: 200,
      descripcion: 'Consume GET /reservas enviando Authorization: Bearer <token válido>. La API responde 200 con las reservas.',
      estado: 'pendiente'
    },
    {
      n: 3, titulo: 'Token incorrecto', metodo: 'GET', ruta: '/reservas',
      auth: 'invalido', esperado: 401,
      descripcion: 'Mismo endpoint con un token inválido (firma incorrecta). El middleware responde 401 token_invalido.',
      estado: 'pendiente'
    },
    {
      n: 4, titulo: 'Sin header Authorization', metodo: 'GET', ruta: '/reservas',
      auth: 'ninguno', esperado: 401,
      descripcion: 'Mismo endpoint sin el header. El middleware responde 401 token_ausente.',
      estado: 'pendiente'
    }
  ];

  // Test script real de la request 1 en la coleccion de Postman
  readonly codigoTest = `// Test script de "1) POST /login" en Postman:
pm.test('Status 200', () =>
  pm.response.to.have.status(200));

const data = pm.response.json();
pm.test('Respuesta contiene token', () =>
  pm.expect(data).to.have.property('token'));

// Guarda el token en la variable {{token}} de la
// colección: las demás requests usan Bearer {{token}}
pm.collectionVariables.set('token', data.token);`;

  // Ejecuta UNA prueba contra el backend real
  async ejecutar(p: PruebaApi): Promise<void> {
    // La prueba 2 necesita token: si aun no existe, corre primero la 1
    if (p.auth === 'valido' && !this.token) {
      await this.ejecutar(this.pruebas[0]);
    }

    p.estado = 'ejecutando';
    p.status = undefined;
    p.cuerpo = undefined;

    // Construye headers segun el caso de prueba
    const headers: Record<string, string> = {};
    let body: string | undefined;
    if (p.metodo === 'POST') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ usuario: 'admin', password: 'admin123' });
    }
    if (p.auth === 'valido' && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      p.headerEnviado = `Authorization: Bearer ${this.token.slice(0, 28)}...`;
    } else if (p.auth === 'invalido') {
      headers['Authorization'] = 'Bearer token-invalido';
      p.headerEnviado = 'Authorization: Bearer token-invalido';
    } else {
      p.headerEnviado = '(sin header Authorization)';
    }

    try {
      const resp = await fetch(`${API_URL}${p.ruta}`, { method: p.metodo, headers, body });
      p.status = resp.status;
      const data = await resp.json();

      // La prueba 1 guarda el token (mostrado truncado; es largo)
      if (p.n === 1 && data.token) {
        this.token = data.token;
        p.cuerpo = JSON.stringify({ token: data.token.slice(0, 42) + '...' }, null, 2);
      } else {
        p.cuerpo = JSON.stringify(data, null, 2);
      }

      // PASS si el status coincide con el esperado (igual que pm.test)
      p.estado = resp.status === p.esperado ? 'exito' : 'fallo';
    } catch {
      p.estado = 'fallo';
      p.cuerpo = 'No se pudo conectar con la API. ¿Está encendido el backend (puerto 3000)?';
    }
  }

  // Ejecuta las 4 pruebas en orden (como "Run collection" en Postman)
  async ejecutarTodas(): Promise<void> {
    this.ejecutandoTodas = true;
    this.reiniciar();
    for (const p of this.pruebas) {
      await this.ejecutar(p);
      await new Promise((r) => setTimeout(r, 300)); // pausa breve para seguir el flujo
    }
    this.ejecutandoTodas = false;
  }

  reiniciar(): void {
    this.token = null;
    for (const p of this.pruebas) {
      p.estado = 'pendiente';
      p.status = undefined;
      p.cuerpo = undefined;
      p.headerEnviado = undefined;
    }
  }

  get totalExito(): number {
    return this.pruebas.filter((p) => p.estado === 'exito').length;
  }
}
