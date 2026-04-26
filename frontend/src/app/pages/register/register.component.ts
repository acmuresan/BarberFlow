import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

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
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        // Asumimos 201 Created
        // Redirigimos al login para que inicie sesión normalmente
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage =
            'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
        } else if (err.status === 400) {
          this.errorMessage = 'Revisa los datos introducidos. Faltan campos obligatorios.';
        } else {
          this.errorMessage = 'Error inesperado. Inténtalo más tarde.';
        }
      },
    });
  }
}
