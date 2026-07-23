import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Source } from '../../assets/entities/sourceEntities';
import { ViewMode } from '../../assets/entities/ViewMode';

@Component({
  selector: 'app-fonte-detail',
  imports: [CommonModule],
  templateUrl: './fonte-detail.html',
  styleUrl: './fonte-detail.scss',
  standalone: true
})
export class FonteDetail {
  VIEW_MODE = ViewMode;

  mode: ViewMode = this.VIEW_MODE.VIEW;
  @Input() fonte!: Source | null;
  @Input() path!: string | null;
  @Output() closeModal = new EventEmitter<void>();
  fonteBackup!: Source | null;

  close() {
    this.fonte = null as any;
    this.fonteBackup = null as any;
    this.closeModal.emit();
  }

  // PER ATTIVARE LA MODALITÁ DI MODIFICA
  toggleEditFonteMode() {
    this.mode = this.VIEW_MODE.EDIT;
    this.fonteBackup = structuredClone(this.fonte);
  }

  // PER ATTIVARE LA MODALITÁ DI VISUALIZZAZIONE
  toggleViewFonteMode() {
    this.mode = this.VIEW_MODE.VIEW;
    this.fonte = structuredClone(this.fonteBackup);
  }

  saveFonte() { }
}