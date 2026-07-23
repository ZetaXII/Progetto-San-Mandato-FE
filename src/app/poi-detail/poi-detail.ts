import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arraySecoli, gruppiArea, Poi, PoiCreateDto } from '../../assets/entities/poiEntities';
import { Source, SourceTypeEnum } from '../../assets/entities/sourceEntities';
import { MarkdownPipe } from "../../assets/pipes/markdown-pipe";
import { PhotoManager } from '../../assets/services/photo-manager';
import { PoiService } from '../../assets/services/poi-service';
import { PopupAlertService } from '../../assets/services/popup-alert-service';
import { FonteDetail } from '../fonte-detail/fonte-detail';
import { ViewMode } from '../../assets/entities/ViewMode';

interface Section {
  id: number,
  title: string
}

@Component({
  selector: 'app-poi-detail',
  imports: [CommonModule, FormsModule, MarkdownPipe, FonteDetail],
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
  selectedFonte: Source | null = null;
  showFonteModal = false;
  pathFonte = "";
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
    this.selectedSection = this.isDesktop ? 1 : 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.poi && !target.closest('.poi-detail-modal') && !target.closest('.card-poi')) {
      this.close();
    }
  }

  selectSection(dotNumber: number) {
    this.selectedSection = dotNumber;
  }

  // SALVATAGGIO DI UN POI
  savePoi() {
    console.log('POI da salvare', this.poi);

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
          console.log('POI aggiornato', updatedPoi);

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

  getFontiByTipologia(tipologia: SourceTypeEnum) {
    return this.poi.sources.filter(fonte => fonte.tipologia === tipologia);
  }

  openFonteDetail(fonte: any, sezione?: string) {
    this.selectedFonte = fonte;
    this.showFonteModal = true;
    this.pathFonte = sezione + " > Fonte " + fonte.tipologia.toLowerCase() + " > " + fonte.titolo;
  }

  closeFonteDetail() {
    this.showFonteModal = false;
    this.selectedFonte = null;
  }
}
