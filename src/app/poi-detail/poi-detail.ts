import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arraySecoli, gruppiArea, Poi, PoiCreateDto } from '../../assets/entities/poiEntities';
import { Source, SourceTypeEnum } from '../../assets/entities/sourceEntities';
import { ViewMode } from '../../assets/entities/ViewMode';
import { MarkdownPipe } from "../../assets/pipes/markdown-pipe";
import { PhotoManager } from '../../assets/services/photo-manager';
import { PoiService } from '../../assets/services/poi-service';
import { PopupAlertService } from '../../assets/services/popup-alert-service';
import { SourceDetail } from '../source-detail/source-detail';

interface Section {
  id: number,
  title: string
}

@Component({
  selector: 'app-poi-detail',
  imports: [CommonModule, FormsModule, MarkdownPipe, SourceDetail],
  templateUrl: './poi-detail.html',
  styleUrl: './poi-detail.scss',
  standalone: true
})
export class PoiDetail {
  VIEW_MODE = ViewMode;
  GRUPPI_AREA = gruppiArea;
  SECOLI = arraySecoli;
  SOURCE_TYPES = SourceTypeEnum;

  mode: ViewMode = this.VIEW_MODE.VIEW;
  @Input() poi!: Poi;
  @Output() closeDetailPoi = new EventEmitter<void>();
  sections: Section[] = [];
  selectedSection: number = 0;
  selectedSource: Source | null = null;
  showSourceModal = false;
  isCreatingSource = false;
  pathSource = "";
  poiBackup!: Poi;
  isDesktop = window.innerWidth >= 769;

  constructor(
    public photoManagerService: PhotoManager,
    public poiService: PoiService,
    private _popupAlertService: PopupAlertService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['poi'] && this.poi) {
      // IMPOSTO LE SEZIONI DEL DETTAGLIO POI
      this.setSections();
    }
  }

  setSections() {
    this.sections = [
      { id: 0, title: "Dettagli" },
      { id: 1, title: "Descrizione generale" },
      { id: 2, title: "Stato attuale" },
      { id: 3, title: "Fonti storiche" },
      { id: 4, title: "Bibliografia" },
    ];
    // SETTO LA SEZIONE DA MOSTRARE ALL'AVVIO
    this.selectedSection = this.isDesktop ? this.selectedSection || 1 : 0;
  }

  selectSection(dotNumber: number) {
    this.selectedSection = dotNumber;
  }

  // SALVATAGGIO DI UN POI
  savePoi() {
    if (!this.poi) return;

    const poiCreateData: PoiCreateDto = {
      name: this.poi.name,
      isLocalized: this.poi.localized,
      address: this.poi.address,
      latitude: this.poi.latitude,
      longitude: this.poi.longitude,
      constructionCentury: this.poi.constructionCentury,
      areaGroup: this.poi.areaGroup,
      generalDescription: this.poi.generalDescription,
      currentStatus: this.poi.currentStatus,
      bibliography: this.poi.bibliography,
      coverImageUrl: this.poi.coverImageUrl,
      architectIds: this.poi.architects || []
    };

    this.poiService.updatePoi(this.poi.uuid, poiCreateData)
      .subscribe({
        next: (updatedPoi) => {
          this.poi = structuredClone(updatedPoi);
          this.poiBackup = structuredClone(updatedPoi);
          this.poiService.updatePoiListElement(updatedPoi);

          this._popupAlertService.show('Salvataggio riuscito', 'Villa salvata correttamente', 1);
        },
        error: (err) => {
          console.error('Errore aggiornamento POI', err)
          this._popupAlertService.show("Salvataggio non riuscito (" + err.status + ")", err.message, 3);
        }
      });
  }

  onSourceUpdated(updatedSource: Source) {
    if (this.poi && this.poi.sources) {
      const idx = this.poi.sources.findIndex(s => s.uuid === updatedSource.uuid);
      if (idx !== -1) {
        this.poi.sources[idx] = updatedSource;
        this.poi = { ...this.poi };
        this.poiBackup = { ...this.poi };
        this.poiService.updatePoiListElement(this.poi);
      }
    }
  }

  onSourceCreated(createdSource: Source) {
    if (this.poi && this.poi.sources) {
      this.poi.sources.push(createdSource);
      this.poi = { ...this.poi };
      this.poiBackup = { ...this.poi };
      this.poiService.updatePoiListElement(this.poi);
    }
  }

  // CHIUDE LA MODALE
  close() {
    this.poi = null as any;
    this.poiBackup = null as any;
    this.closeDetailPoi.emit();
  }

  // PER ATTIVARE LA MODALITÁ DI MODIFICA
  toggleEditPoiMode() {
    this.mode = this.VIEW_MODE.EDIT;
    this.poiBackup = structuredClone(this.poi);
    this.setSections();
  }

  // PER ATTIVARE LA MODALITÁ DI VISUALIZZAZIONE
  toggleViewPoiMode() {
    this.mode = this.VIEW_MODE.VIEW;
    this.poi = structuredClone(this.poiBackup);
    this.setSections();
  }

  // PER VERIFICARE LA DIMENSIONE DELLA PAGINA
  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 769;
    // SE LO SCHERMO É MAGGIORE DI 769px E SONO NELLA SEZIONE "DETTAGLIO" ALLORA LO SPOSTO ALLA SEZIONE SUCCESSIVA DA DESKTOP
    if (this.isDesktop && this.selectedSection === 0) {
      this.selectedSection = 1;
    }
  }

  getSourcesByTipologia(tipologia: SourceTypeEnum) {
    return this.poi.sources.filter(source => source.tipologia === tipologia);
  }

  openSourceDetail(source: Source | null, sezione?: string) {
    this.selectedSource = source!;
    this.showSourceModal = true;
    this.pathSource = sezione + " > ";
  }

  deleteSource(sourceUuid: string) {
    this.poiService.deleteSource(this.poi.uuid, sourceUuid).subscribe({
      next: () => {
        this.poi.sources = this.poi.sources.filter(s => s.uuid !== sourceUuid);
        this.poi = { ...this.poi };
        this.poiBackup = { ...this.poi };
        this._popupAlertService.show('Eliminazione riuscita', 'Fonte eliminata correttamente', 1);
      },
      error: (err) => {
        console.error('Errore eliminazione fonte', err)
        this._popupAlertService.show("Eliminazione non riuscita (" + err.status + ")", err.message, 3);
      }
    });
  }

  onSourceDeleted(deletedSourceUuid: string) {
    if (deletedSourceUuid) {
      this.deleteSource(deletedSourceUuid);
    }
  }

  closeSourceDetail() {
    this.isCreatingSource = false;
    this.showSourceModal = false;
    this.selectedSource = null;
  }

  addSource() {
    this.isCreatingSource = true;
    this.openSourceDetail(null, this.sections[3].title + ' > Nuova fonte');
  }
}
