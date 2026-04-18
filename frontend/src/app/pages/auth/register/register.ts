import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern('^[0-9]{9}$')]], // Validación básica de 9 números
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          console.log('Usuario registrado', res);
          alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro', err);
        },
      });
    } else {
      // 1. Mostrar en consola por qué falla (ideal para depurar)
      console.warn('Formulario inválido. Estado:', this.registerForm.value);

      // 2. Marcar todos los campos como tocados para disparar los errores visuales en el HTML
      this.registerForm.markAllAsTouched();
    }
  }
}
