import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fonte-detail',
  templateUrl: './fonte-detail.html',
  styleUrl: './fonte-detail.scss',
})
export class FonteDetail {
  @Input() fonte: any;
  @Input() path: any;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}