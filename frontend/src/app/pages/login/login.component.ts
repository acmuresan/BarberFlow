import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const rol = this.authService.getRol();
        this.redirigirSegunRol(rol);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else {
          this.errorMessage = 'Error en el servidor. Inténtalo más tarde.';
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
