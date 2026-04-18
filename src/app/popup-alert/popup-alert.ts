import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// 0 = info, 1 = success, 2 = warning, 3 = error
export type AlertType = 0 | 1 | 2 | 3;

@Component({
  selector: 'app-popup-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-alert.html',
  styleUrl: './popup-alert.scss',
})
export class PopupAlert {
  @Input() title = '';
  @Input() message = '';
  @Input() type: AlertType = 0;
  @Input() visible = false;

  get cssClass() {
    switch (this.type) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'info';
    }
  }
}