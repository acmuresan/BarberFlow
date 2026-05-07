import { Injectable, signal } from '@angular/core';

export interface ToastData {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  // Signals para reactividad síncrona y sin suscripciones
  isLoading = signal<boolean>(false);
  toast = signal<ToastData | null>(null);

  private activeRequests = 0; // Para manejar múltiples peticiones simultáneas
  private timeoutId: any;

  showLoading() {
    this.activeRequests++;
    this.isLoading.set(true);
  }

  hideLoading() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.isLoading.set(false);
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    // Si había un temporizador corriendo, se anula
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.toast.set({ message, type });

    // Empieza uno nuevo
    this.timeoutId = setTimeout(() => {
      this.toast.set(null);
    }, 3000);
  }
}
