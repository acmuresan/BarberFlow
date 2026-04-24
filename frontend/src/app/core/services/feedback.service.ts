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
    this.toast.set({ message, type });
    // Auto-ocultar a los 3 segundos
    setTimeout(() => this.toast.set(null), 3000);
  }
}
