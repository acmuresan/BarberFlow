import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="feedback.toast() as t">
      <div class="toast" [ngClass]="t.type">
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9998;
        width: 90%;
        max-width: 400px;
      }
      .toast {
        padding: 16px;
        border-radius: 8px;
        color: white;
        text-align: center;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .success {
        background-color: #28a745;
      }
      .error {
        background-color: #dc3545;
      }
    `,
  ],
})
export class ToastComponent {
  feedback = inject(FeedbackService);
}
