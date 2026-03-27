import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { arraySecoli, gruppiArea, Poi, PoiCreateDto } from '../../assets/entities/poiEntities';
import { PhotoManager } from '../../assets/services/photo-manager';
import { FormsModule } from '@angular/forms';
import { PoiService } from '../../assets/services/poi-service';
import { MarkdownPipe } from "../../assets/pipes/markdown-pipe";

interface Section {
  id: number,
  title: string,
  content: any
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
  @Input() poi!: Poi | null;
  @Output() closeDetailPoi = new EventEmitter<void>();
  sections: Section[] = [];
  selectedSection: number = 0;
  poiBackup!: Poi | null;

  GRUPPI_AREA = gruppiArea;
  SECOLI = arraySecoli;

  constructor(public photoManagerService: PhotoManager, private _poiService: PoiService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['poi'] && this.poi) {
      // IMPOSTO LE SEZIONI DEL DETTAGLIO POI
      this.setSections();
    }
  }

  setSections() {
    if (this.mode === 'edit' || this.mode === 'create') {
      this.sections = [
        { id: 0, title: "Descrizione generale", content: this.poi?.generalDescription || "" },
        { id: 1, title: "Stato attuale", content: this.poi?.currentStatus || "" },
        { id: 2, title: "Bibliografia", content: this.poi?.bibliography || "" },
      ];
    } else {
      this.sections = [
        this.poi?.generalDescription && { id: 0, title: "Descrizione generale", content: this.poi.generalDescription },
        this.poi?.currentStatus && { id: 1, title: "Stato attuale", content: this.poi.currentStatus },
        this.poi?.bibliography && { id: 2, title: "Bibliografia", content: this.poi.bibliography }
      ].filter(Boolean) as Section[];
    }
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

    const descrizioneGenerale = this.sections[0]?.content || "";
    const statoAttuale = this.sections[1]?.content || "";
    const bibliografia = this.sections[2]?.content || "";

    const poiCreateData: PoiCreateDto = {
      name: this.poi.name,
      isLocalized: this.poi.localized,
      address: this.poi.address,
      latitude: this.poi.latitude,
      longitude: this.poi.longitude,
      constructionCentury: this.poi.constructionCentury,
      areaGroup: this.poi.areaGroup,
      generalDescription: descrizioneGenerale,
      currentStatus: statoAttuale,
      bibliography: bibliografia,
      coverImageUrl: this.poi.coverImageUrl,
      architectIds: this.poi.architects || []
    };

    this._poiService.updatePoi(this.poi.uuid, poiCreateData)
      .subscribe({
        next: (updatedPoi) => {
          console.log('POI aggiornato', updatedPoi);
          this.poi = structuredClone(updatedPoi);
        },
        error: (err) => console.error('Errore aggiornamento POI', err)
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
}
