import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { FeedbackService } from '../../core/services/feedback.service';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);
  errorMessage: string = '';
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage = '';

    this.authService
      .login(this.loginForm.value)
      .pipe(
        // finalize apaga el loader sin importar si da 200 o 401
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.feedback.showToast('¡Bienvenido a BarberFlow!', 'success');
          const user = this.authService.currentUser();
          this.redirigirSegunRol(user?.rol || null);
        },
        error: (err) => {
          if (err.status === 401) {
            this.errorMessage = 'Credenciales incorrectas. Revisa tu email y contraseña.';
          } else {
            this.errorMessage = 'Error de conexión con el servidor.';
          }
        },
      });
  }
  private redirigirSegunRol(rol: string | null): void {
    switch (rol) {
      case 'admin':
        this.router.navigate(['/panel-admin']);
        break;
      case 'barbero':
        this.router.navigate(['/panel-barbero']);
        break;
      case 'cliente':
      default:
        this.router.navigate(['/mis-citas']); // O al wizard de reservas
        break;
    }
  }
}
