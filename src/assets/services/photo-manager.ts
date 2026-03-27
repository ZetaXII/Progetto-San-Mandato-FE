import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoManager {

  public readonly DEFAULT_IMAGE = 'assets/images/no-photo.jpeg';

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;

    if (img.src.includes(this.DEFAULT_IMAGE)) return;

    img.src = this.DEFAULT_IMAGE;
  }

}
