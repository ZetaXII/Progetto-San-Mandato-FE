import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import { Subscription } from 'rxjs';
import { Poi } from '../../assets/entities/poiEntities';
import { PoiService } from '../../assets/services/poi-service';
import { PoiDetail } from '../poi-detail/poi-detail';

interface PoiMapItem {
  uuid: string;
  name: string;
  address: string;
  areaGroup: string;
  latitude: number;
  longitude: number;
  localized: boolean;
}

export interface MapOverlayLayer {
  id: string;
  name: string;
  tifUrl: string;
  leafletLayer?: any;
  visible: boolean;
  opacity: number;
}

@Component({
  selector: 'app-mappa',
  standalone: true,
  imports: [CommonModule, PoiDetail],
  templateUrl: './mappa.html',
  styleUrl: './mappa.scss'
})
export class Mappa implements OnInit, OnDestroy {
  pois: PoiMapItem[] = [];
  selectedPoi: Poi | null = null;
  isLoadingPoi = false;
  isLoadingTif = false;
  tifError: string | null = null;

  overlayLayers: MapOverlayLayer[] = [
    {
      id: 'duca-di-noja',
      name: 'Mappa Duca di Noja',
      tifUrl: 'assets/qgis_maps/duca_di_noja.tif',
      visible: true,
      opacity: 1
    }
  ];

  private map: any;
  private markers: any[] = [];
  private poiSub!: Subscription;

  isBrowser = false;

  constructor(
    private poiService: PoiService,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private isValidCoordinate(lat: any, lng: any): boolean {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    return (
      isFinite(latNum) && isFinite(lngNum) &&
      latNum >= -90 && latNum <= 90 &&
      lngNum >= -180 && lngNum <= 180 &&
      !(latNum === 0 && lngNum === 0)
    );
  }

  ngOnInit() {
    this.poiSub = this.poiService.getAllPois().subscribe({
      next: (data) => {
        this.pois = data
          .filter(poi => this.isValidCoordinate(poi.latitude, poi.longitude))
          .map(poi => ({
            uuid: poi.uuid,
            name: poi.name,
            address: poi.address,
            areaGroup: poi.areaGroup,
            latitude: Number(poi.latitude),
            longitude: Number(poi.longitude),
            localized: poi.localized
          }));

        if (this.isBrowser && !this.map) {
          setTimeout(() => this.initMap(), 200);
        }
      },
      error: (err) => console.error('Errore caricamento POI:', err)
    });
  }
  async initMap() {
    const L = await import('leaflet');

    this.zone.runOutsideAngular(() => {
      this.map = L.map('map', {
        center: [40.8518, 14.2681],
        zoom: 17,
        minZoom: 8,
        maxZoom: 17.5,
        maxBoundsViscosity: 1.0,
        bounceAtZoomLimits: false,
        zoomControl: false,
        preferCanvas: true
      });

      L.control.zoom({ position: 'topright' }).addTo(this.map);

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 17.5
        }
      );
      satelliteLayer.addTo(this.map);
    });

    await this.loadTifOverlays();

    // Aggiunta dei marker dei POI
    this.pois.forEach(poi => {
      const customDivIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pulse"></div><div class="marker-pin"><i class="ri-map-pin-2-fill"></i></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([poi.latitude, poi.longitude], { icon: customDivIcon }).addTo(this.map);
      marker.on('click', () => this.zone.run(() => this.loadAndOpenPoi(poi.uuid)));
      this.markers.push({ poiUuid: poi.uuid, marker });
    });
  }

  private async loadTifOverlays() {
    this.zone.run(() => this.isLoadingTif = true);

    await this.zone.runOutsideAngular(async () => {
      const L = await import('leaflet');

      for (const layer of this.overlayLayers) {
        try {
          const response = await fetch(layer.tifUrl);
          const arrayBuffer = await response.arrayBuffer();
          const georaster = await parseGeoRaster(arrayBuffer);

          const geoTifLayer = new GeoRasterLayer({
            georaster: georaster,
            opacity: layer.opacity,
            resolution: 200,
            useWorker: true,
            caching: true,
            suppressWarning: true,
            pixelValuesToColorFn: (values: number[]) => {
              if (!values || values.length === 0) return null;

              const r = values[0];
              const g = values[1];
              const b = values[2];
              const alpha = values[3];

              if (alpha !== undefined && alpha === 0) return null;
              if (r <= 15 && g <= 15 && b <= 15) return null;
              if (r >= 245 && g >= 245 && b >= 245) return null;

              return `rgb(${r},${g},${b})`;
            }
          });

          layer.leafletLayer = geoTifLayer;

          if (layer.visible) {
            geoTifLayer.addTo(this.map);

            const { ymin, ymax, xmin, xmax } = georaster;

            // Margine per la navigazione esterna (Napoli/Golfo)
            const latPadding = 0.05;
            const lngPadding = 0.06;

            const extendedBounds = L.latLngBounds(
              [ymin - latPadding, xmin - lngPadding],
              [ymax + latPadding, xmax + lngPadding]
            );

            // 1. Limiti di scorrimento massimi
            this.map.setMaxBounds(extendedBounds);

            // 2. Calcolo del minZoom per non far uscire l'utente dall'area delimitata
            const idealMinZoom = this.map.getBoundsZoom(extendedBounds, false);
            this.map.setMinZoom(idealMinZoom - 2);

            // 3. CENTRO E ZOOM INIZIALE AL MASSIMO DETTAGLIO
            // Calcoliamo il centro esatto della mappa Duca di Noja
            const centerLat = (ymin + ymax + 0.001) / 2;
            const centerLng = (xmin + xmax) / 2;

            // Posizioniamo la mappa al centro del GeoTIFF con lo zoom massimo definito (17.5)
            this.map.setView([centerLat, centerLng], 17);
          }
        } catch (err) {
          console.error(`Errore nel caricamento del file .tif (${layer.tifUrl}):`, err);
          this.zone.run(() => {
            this.tifError = `Impossibile leggere il file ${layer.tifUrl}. Verificare che sia presente negli asset.`;
          });
        }
      }
    });

    this.zone.run(() => this.isLoadingTif = false);
  }

  toggleOverlayLayer(layer: MapOverlayLayer) {
    if (!this.map || !layer.leafletLayer) return;

    this.zone.runOutsideAngular(() => {
      if (layer.visible) {
        this.map.removeLayer(layer.leafletLayer);
      } else {
        layer.leafletLayer.addTo(this.map);
      }
    });
    layer.visible = !layer.visible;
  }

  setOverlayOpacity(layer: MapOverlayLayer, opacity: number) {
    layer.opacity = opacity;
    if (layer.leafletLayer && layer.leafletLayer.setOpacity) {
      this.zone.runOutsideAngular(() => {
        layer.leafletLayer.setOpacity(opacity);
      });
    }
  }

  loadAndOpenPoi(uuid: string) {
    if (this.isLoadingPoi) return;
    this.isLoadingPoi = true;
    this.poiService.getPoi(uuid).subscribe({
      next: (poi) => {
        this.selectedPoi = poi;
        this.isLoadingPoi = false;
      },
      error: (err) => {
        console.error('Errore caricamento dettaglio POI', err);
        this.isLoadingPoi = false;
      }
    });
  }

  closePoiDetail() {
    this.selectedPoi = null;
  }

  ngOnDestroy() {
    if (this.poiSub) this.poiSub.unsubscribe();
    if (this.map) this.map.remove();
  }
}