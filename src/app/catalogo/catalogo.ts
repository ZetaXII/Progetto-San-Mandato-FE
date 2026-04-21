import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arraySecoli, gruppiArea, PageResponse, Poi } from '../../assets/entities/poiEntities';
import { PoiService } from '../../assets/services/poi-service';
import { CardPoi } from '../card-poi/card-poi';
import { PoiDetail } from '../poi-detail/poi-detail';
import { Observable } from 'rxjs';

export interface SearchPoisByFilters {
  name?: string;
  areaGroup?: string;
  constructionCentury?: string;
  generalDescription?: string;
  address?: string;
  isLocalized?: boolean;
}

@Component({
  selector: 'app-catalogo',
  imports: [CardPoi, PoiDetail, CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo implements OnInit {
  selectedPoi: Poi | null = null;
  searchPoisByFilters: SearchPoisByFilters = {};
  totalPois = 0;
  isLoading = false;
  currentPage = 0;
  poisPage!: PageResponse<Poi>;
  showScrollBar: boolean = true;
  showFilterPanel: boolean = false;
  poiList$: Observable<Poi[]>;

  GRUPPI_AREA = gruppiArea;
  SECOLI = arraySecoli;

  private _pageSize = 0;
  private _searchTimeout: any;

  constructor(
    public poiService: PoiService,
    private cdr: ChangeDetectorRef) {
    this._pageSize = this.poiService.PAGE_SIZE;
    this._initSearchPoiByFIlters();
    this.poiList$ = this.poiService.poiList$;
  }

  ngOnInit() {
    this.searchPois(true);
  }

  private _initSearchPoiByFIlters() {
    this.searchPoisByFilters.constructionCentury = "";
    this.searchPoisByFilters.areaGroup = "";
  }

  searchPois(initStatusBool: boolean = false) {
    if (this.isLoading) { return };
    this.isLoading = true;
    this.cdr.detectChanges();

    this.poiService.searchPois(this.searchPoisByFilters, 0, this._pageSize).subscribe({
      next: (page) => {
        setTimeout(() => {
          this.poisPage = page;
          if (initStatusBool) {
            this.totalPois = page.totalElements;
          }
          this.poiService.setPoiList(page.content);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
      },
      error: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.poiService.setPoiList([]);
          this.cdr.detectChanges();
        }, 500);
      }
    });
  }

  onSearchInput() {
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.poiService.setPoiList([]);
      this.searchPois();
    }, 300);
  }

  private loadNextPage() {
    if (this.isLoading || !this.poisPage) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.poiService.searchPois(this.searchPoisByFilters, this.currentPage, this._pageSize).subscribe({
      next: (page) => {
        setTimeout(() => {
          this.poiService.setPoiList([...this.poiService.getPoiList(), ...(page.content || [])]);
          this.poisPage = page;
          this.totalPois = page.totalElements || 0;
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
      },
      error: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
      }
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (this.isLoading) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Carica prossima pagina in fondo
    if (scrollTop + clientHeight >= scrollHeight - 100 && this.poisPage &&
      this.currentPage < (this.poisPage.totalPages! - 1)) {
      this.currentPage++;
      this.loadNextPage();
    }
  }

  onPoiClick(poi: Poi) {
    this.selectedPoi = structuredClone(poi);
    this.showScrollBar = false;
  }

  onCloseDetail() {
    this.selectedPoi = null;
    this.showScrollBar = true;
  }

  toggleShowFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  resetFilters() {
    this.searchPoisByFilters = {
      name: this.searchPoisByFilters?.name,
      areaGroup: "",
      constructionCentury: "",
      generalDescription: "",
      address: "",
      isLocalized: undefined,
    };
  }

}
