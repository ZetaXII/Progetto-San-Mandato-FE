import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arraySecoli } from '../../assets/entities/poiEntities';
import { Source, SourceCreateDto, SourceTypeEnum } from '../../assets/entities/sourceEntities';
import { ViewMode } from '../../assets/entities/ViewMode';
import { DialogService } from '../../assets/services/dialog-service';
import { PoiService } from '../../assets/services/poi-service';
import { PopupAlertService } from '../../assets/services/popup-alert-service';

@Component({
  selector: 'app-source-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './source-detail.html',
  styleUrl: './source-detail.scss',
  standalone: true
})
export class SourceDetail implements OnChanges {
  VIEW_MODE = ViewMode;
  SOURCE_TYPES = Object.values(SourceTypeEnum);
  SECOLI = arraySecoli;

  mode: ViewMode = this.VIEW_MODE.VIEW;
  @Input() source!: Source | null;
  @Input() initialPath!: string | null;
  @Input() poiUuid!: string | null;
  @Input() isCreatingSource!: boolean;
  @Output() closeModal = new EventEmitter<void>();
  @Output() sourceUpdated = new EventEmitter<Source>();
  @Output() sourceCreated = new EventEmitter<Source>();
  @Output() sourceDeleted = new EventEmitter<string>();
  sourceBackup!: Source | null;
  path!: string | null;

  constructor(
    private poiService: PoiService,
    private popupAlertService: PopupAlertService,
    private dialogService: DialogService
  ) { }

  ngOnChanges(): void {
    this.setSourcePath();
    if (this.isCreatingSource) {
      this.mode = this.VIEW_MODE.CREATE;
      this.source = {
        uuid: '',
        titolo: '',
        tipologia: SourceTypeEnum.PARIEGETICA,
        riferimento: '',
        secolo: null,
        anno: null,
        trascrizione: ''
      };
    }
  }

  close() {
    this.source = null as any;
    this.sourceBackup = null as any;
    this.closeModal.emit();
  }

  // PER ATTIVARE LA MODALITÁ DI MODIFICA
  toggleEditSourceMode() {
    this.mode = this.VIEW_MODE.EDIT;
    this.sourceBackup = structuredClone(this.source);
  }

  // PER ATTIVARE LA MODALITÁ DI VISUALIZZAZIONE
  toggleViewSourceMode() {
    this.mode = this.VIEW_MODE.VIEW;
    this.source = structuredClone(this.sourceBackup);
  }

  // SALVATAGGIO DI UNA FONTE
  saveSource() {
    if (!this.source || !this.poiUuid) return;

    const sourceCreateDto: SourceCreateDto = {
      titolo: this.source.titolo,
      tipologia: this.source.tipologia,
      riferimento: this.source.riferimento,
      secolo: this.source.secolo,
      anno: this.source.anno,
      trascrizione: this.source.trascrizione
    };

    if (this.mode === this.VIEW_MODE.CREATE) {
      // CREA FONTE
      this.poiService.createSource(this.poiUuid, sourceCreateDto).subscribe({
        next: (createdSource) => {
          this.source = structuredClone(createdSource);
          this.sourceBackup = structuredClone(createdSource);
          this.sourceCreated.emit(createdSource);
          this.popupAlertService.show('Creazione riuscita', 'Fonte creata correttamente', 1);
          this.mode = this.VIEW_MODE.VIEW;
          this.setSourcePath();
        },
        error: (err) => {
          console.error('Errore creazione fonte', err);
          this.popupAlertService.show("Creazione non riuscita (" + err.status + ")", err.message, 3);
        }
      });
    } else {
      // MODIFICA FONTE
      this.poiService.updateSource(this.poiUuid, this.source.uuid, sourceCreateDto).subscribe({
        next: (updatedSource) => {
          this.source = structuredClone(updatedSource);
          this.sourceBackup = structuredClone(updatedSource);
          this.sourceUpdated.emit(updatedSource);
          this.popupAlertService.show('Salvataggio riuscito', 'Fonte salvata correttamente', 1);
          this.mode = this.VIEW_MODE.VIEW;
          this.setSourcePath();
        },
        error: (err) => {
          console.error('Errore aggiornamento fonte', err);
          this.popupAlertService.show("Salvataggio non riuscito (" + err.status + ")", err.message, 3);
        }
      });
    }
  }

  // ELIMINA FONTE
  deleteSource() {
    this.dialogService.confirm({
      titolo: 'Elimina Fonte',
      messaggio: `Sei sicuro di voler procedere con l'eliminazione della fonte '${this.source?.titolo}'? L'operazione non è reversibile.`,
      testoProcedi: 'Procedi',
      testoAnnulla: 'Annulla'
    }).then((confirmed) => {
      if (confirmed && this.source && this.poiUuid) {
        this.sourceDeleted.emit(this.source.uuid);
        this.close();
      }
    });
  }

  setSourcePath() {
    if (!this.source) return;
    this.path = (this.initialPath || "") + "Fonte " + this.source.tipologia.toLowerCase() + " > " + this.source.titolo;
  }
}