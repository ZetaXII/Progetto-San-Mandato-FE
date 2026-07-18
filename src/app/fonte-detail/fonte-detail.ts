import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Source } from '../../assets/entities/sourceEntities';

@Component({
  selector: 'app-fonte-detail',
  templateUrl: './fonte-detail.html',
  styleUrl: './fonte-detail.scss',
})
export class FonteDetail {
  @Input() fonte!: Source;
  @Input() path!: any;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}