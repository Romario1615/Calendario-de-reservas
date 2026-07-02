import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api';
import { LoginResponse } from '../models/espacio.model';

// ============================================================================
//  AuthService: unico responsable de manejar el token en el frontend.
//  Los componentes NO leen ni escriben el token directamente; usan este servicio.
// ============================================================================
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  // Clave bajo la que se guarda el token en localStorage.
  private readonly TOKEN_KEY = 'token';

  // --- login() --------------------------------------------------------------
  // Pide el token al backend y, si llega, lo guarda. Devuelve un Observable
  // para que el componente reaccione al exito o al error (401).
  login(usuario: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/login`, { usuario, password })
      .pipe(tap((resp) => this.guardarToken(resp.token)));
  }

  // --- logout() -------------------------------------------------------------
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // --- getToken() -----------------------------------------------------------
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // --- isAuthenticated() ----------------------------------------------------
  // Hay sesion valida si existe token y aun no ha expirado.
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.tokenExpirado(token);
  }

  // --- getPayload() ---------------------------------------------------------
  // Devuelve el contenido (payload) del JWT ya decodificado: sub, rol y exp.
  // Util con fines DIDACTICOS: demuestra que el payload va en Base64 y es
  // legible por el cliente (por eso nunca lleva datos sensibles).
  getPayload(): { sub?: string; rol?: string; exp?: number } | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      return JSON.parse(atob(payloadBase64));
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------------------
  //  Detalles internos
  // -------------------------------------------------------------------------
  private guardarToken(token: string): void {
    // NOTA DE SEGURIDAD (trade-off):
    // Guardamos el token en localStorage por simplicidad para la DEMO.
    // Inconveniente: es accesible por JavaScript, por lo que es vulnerable a
    // ataques XSS (un script malicioso podria leerlo).
    // Alternativas mas seguras:
    //   - Cookie httpOnly + SameSite: el JS no puede leerla (mitiga XSS),
    //     pero requiere manejo de CSRF.
    //   - Mantener el token solo en memoria: se pierde al recargar la pagina.
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Decodifica el payload del JWT (Base64) para leer el claim exp.
  // RECORDATORIO: esto solo LEE el payload (que es publico/legible); NO valida
  // la firma. La validacion real de la firma la hace el backend.
  private tokenExpirado(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      if (!payload.exp) {
        return false;
      }
      const ahoraEnSegundos = Math.floor(Date.now() / 1000);
      return payload.exp < ahoraEnSegundos;
    } catch {
      // Si el token esta malformado, lo tratamos como expirado/invalido.
      return true;
    }
  }
}
