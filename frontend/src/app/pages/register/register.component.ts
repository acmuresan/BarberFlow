import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private feedback = inject(FeedbackService);

  registerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    telefono: [''], // Opcional, sin validadores
  });

  errorMessage: string = '';
  isLoading = signal<boolean>(false);

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    // Activamos el loader visual
    this.isLoading.set(true);
    this.errorMessage = '';

    this.authService
      .register(this.registerForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.feedback.showToast('¡Registro completado! Ya puedes iniciar sesión', 'success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?';
          } else {
            this.errorMessage = 'Error interno del servidor. Inténtalo más tarde';
          }
        },
      });
  }
}
