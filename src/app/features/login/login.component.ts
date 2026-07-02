import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PanelExplicacionComponent } from '../../components/panel-explicacion/panel-explicacion.component';
import { CodeCardComponent } from '../../components/code-card/code-card.component';

// ============================================================================
//  Componente de Login: formulario usuario/contrasena.
//  Llama a AuthService.login() y, si tiene exito, navega a /reservas.
//  A la izquierda, un panel contextual explica el flujo con codigo real
//  (heuristica 10 de Nielsen: ayuda y documentacion).
// ============================================================================
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink, PanelExplicacionComponent, CodeCardComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  // Campos del formulario (binding con [(ngModel)])
  usuario = '';
  password = '';

  // Mensaje de error generico y bandera de carga
  error = '';
  cargando = false;

  // --- Fragmentos de código para el panel explicativo -----------------------
  // Emisión del token en el backend (resumen comentado de backend/server.js)
  readonly codigoLogin = `// Compara la contraseña contra el hash bcrypt
const ok = await bcrypt.compare(password, usuario.passwordHash);

if (!encontrado || !ok) {
  // Mensaje GENÉRICO: no revela qué dato falló
  return res.status(401)
    .json({ mensaje: 'Usuario o contrasena incorrectos.' });
}

// Credenciales correctas -> se FIRMA el token
const token = jwt.sign(
  { sub: usuario.usuario, rol: usuario.rol }, // payload mínimo
  process.env.JWT_SECRET,                     // secreto en .env
  { algorithm: 'HS256', expiresIn: '30m' }    // expira en 30 min
);
res.json({ token }); // respuesta exacta: { "token": "..." }`;

  // Consumo desde Angular (resumen comentado de core/auth.service.ts)
  readonly codigoService = `// Envía las credenciales y guarda el token recibido
login(usuario: string, password: string) {
  return this.http
    .post<LoginResponse>(\`\${API_URL}/login\`, { usuario, password })
    .pipe(tap((r) => this.guardarToken(r.token))); // localStorage
}`;

  iniciarSesion(): void {
    this.error = '';
    this.cargando = true;

    this.authService.login(this.usuario, this.password).subscribe({
      next: () => {
        // El token ya quedo guardado por el AuthService. Vamos al recurso protegido.
        this.cargando = false;
        this.router.navigate(['/reservas']);
      },
      error: () => {
        // Mensaje generico (no revelamos si fallo usuario o contrasena).
        this.cargando = false;
        this.error = 'Usuario o contrasena incorrectos.';
      }
    });
  }
}
