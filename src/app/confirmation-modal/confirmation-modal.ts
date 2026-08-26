import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss'
})
export class ConfirmationModal {
  @Input() titolo = 'Conferma Eliminazione';
  @Input() messaggio = 'Sei sicuro di voler procedere con l\'eliminazione? L\'operazione non è reversibile.';
  @Input() testoProcedi = 'Elimina';
  @Input() testoAnnulla = 'Annulla';

  @Output() conferma = new EventEmitter<void>();
  @Output() annulla = new EventEmitter<void>();

  onProcedi() {
    this.conferma.emit();
  }

  onAnnulla() {
    this.annulla.emit();
  }
}
