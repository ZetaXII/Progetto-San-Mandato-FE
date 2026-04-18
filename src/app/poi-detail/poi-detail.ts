import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { arraySecoli, gruppiArea, Poi, PoiCreateDto } from '../../assets/entities/poiEntities';
import { PhotoManager } from '../../assets/services/photo-manager';
import { FormsModule } from '@angular/forms';
import { PoiService } from '../../assets/services/poi-service';
import { MarkdownPipe } from "../../assets/pipes/markdown-pipe";
import { PopupAlertService } from '../../assets/services/popup-alert-service';

interface Section {
  id: number,
  title: string
}

@Component({
  selector: 'app-poi-detail',
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './poi-detail.html',
  styleUrl: './poi-detail.scss',
  standalone: true
})
export class PoiDetail {
  mode: 'view' | 'edit' | 'create' = 'view';
  @Input() poi!: Poi;
  @Output() closeDetailPoi = new EventEmitter<void>();
  sections: Section[] = [];
  selectedSection: number = 0;
  poiBackup!: Poi;
  isDesktop = window.innerWidth >= 769;

  GRUPPI_AREA = gruppiArea;
  SECOLI = arraySecoli;

  constructor(
    public photoManagerService: PhotoManager,
    private _poiService: PoiService,
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
      { id: 3, title: "Bibliografia" },
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

    this._poiService.updatePoi(this.poi.uuid, poiCreateData)
      .subscribe({
        next: (updatedPoi) => {
          console.log('POI aggiornato', updatedPoi);
          this.poi = structuredClone(updatedPoi);
          this._popupAlertService.show('Salvataggio riuscito', 'Villa salvata correttamente', 1);
        },
        error: (err) => {
          console.error('Errore aggiornamento POI', err)
          this._popupAlertService.show("Salvataggio non riuscito ("+err.status+")", err.message, 3);
        }
      });
  }

  // CHIUDE LA MODALE
  close() {
    this.poi = this.poiBackup;
    this.closeDetailPoi.emit();
  }

  // PER ATTIVARE LA MODALITÁ DI MODIFICA
  toggleEditPoiMode() {
    this.mode = 'edit';
    this.poiBackup = structuredClone(this.poi);
    this.setSections();
  }

  // PER ATTIVARE LA MODALITÁ DI MODIFICA
  toggleViewPoiMode() {
    this.mode = 'view';
    this.poi = structuredClone(this.poiBackup);
    this.setSections();
  }

  // PER VERIFICARE LA DIMENSIONE DELLA PAGINA
  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 769;
    // SE LO SCHERMO É MAGGIORE DI 769px E SONO NELLA SEZIONE "DETTAGLIO"ALLORA LO SPOSTO ALLA SEZIONE SUCCESSIVA DA DESKTOP
    if (this.isDesktop && this.selectedSection === 0) {
      this.selectedSection = 1;
    }
  }
}
