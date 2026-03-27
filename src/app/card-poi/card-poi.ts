import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Poi } from '../../assets/entities/poiEntities';
import { PhotoManager } from '../../assets/services/photo-manager';

@Component({
  selector: 'app-card-poi',
  imports: [CommonModule],
  templateUrl: './card-poi.html',
  styleUrl: './card-poi.scss',
})
export class CardPoi {
  @Input() poi!: Poi;
  @Input() isActive = false;
  @Output() poiClick = new EventEmitter<Poi>();
  coverImageUrl: string = "";

  constructor(public photoManagerService: PhotoManager) { }
}
