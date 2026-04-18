import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos RouterLink para manejar el enlace al registro
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definimos el formulario con validaciones básicas
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  onLogin(): void {
    if (this.loginForm.valid) {
      // Llamamos al servicio con los datos del formulario
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log('Login exitoso', res);
          this.redirectByUserRole();
        },
        error: (err) => {
          console.error('Error en el acceso', err);
          // Aquí se podrá añadir una variable para mostrar un error en el HTML
        },
      });
    } else {
      // Si el formulario no es válido, se marcan los campos para mostrar errores
      this.loginForm.markAllAsTouched();
    }
  }

  private redirectByUserRole(): void {
    const rol = localStorage.getItem('rol');
    if (rol === 'admin') {
      this.router.navigate(['/admin-panel']);
    } else if (rol === 'barbero') {
      this.router.navigate(['/barber-panel']);
    } else {
      this.router.navigate(['/mis-citas']);
    }
  }
}
