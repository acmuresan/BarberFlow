import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private feedback: FeedbackService,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      telefono: [''], // Opcional
    });
  }

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
          this.feedback.showToast(
            '¡Registro completado con éxito! Ya puedes iniciar sesión.',
            'success',
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en registro:', err);

          // Lógica de captura del Error 409
          if (err.status === 409) {
            const mensajeBackend = err.error?.error || 'El email ya está registrado';
            this.errorMessage = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?';
            this.feedback.showToast(mensajeBackend, 'error');
          } else {
            this.errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            this.feedback.showToast('Error al registrar usuario', 'error');
          }
        },
      });
  }
}
