import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';

export const carouselImagesPaths: string[] = [
  'assets/images/carousel_san_mandato/img1.jpg',
  'assets/images/carousel_san_mandato/img2.jpg',
  'assets/images/carousel_san_mandato/img3.jpg',
  'assets/images/carousel_san_mandato/img4.jpg',
  'assets/images/carousel_san_mandato/img5.jpg',
  'assets/images/carousel_san_mandato/img6.jpg',
  'assets/images/carousel_san_mandato/img7.jpg'
];

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class Gallery implements OnInit, OnDestroy {

  current = 0;
  isFullscreen = false;
  photos = carouselImagesPaths;
  swipeDirection: 'left' | 'right' | null = null;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly AUTOPLAY_DELAY = 4000;
  private readonly RESTART_DELAY = 8000;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.preloadImages();
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  private preloadImages() {
    this.photos.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  openFullscreen() {
    this.isFullscreen = true;
    this.stopAutoplay();
    this.cdr.detectChanges();
  }

  closeFullscreen() {
    this.isFullscreen = false;
    this.restartAutoplay();
    this.cdr.detectChanges();
  }

  private setCurrent(index: number, direction?: 'left' | 'right') {
    this.swipeDirection = direction || null;
    this.current = (index + this.photos.length) % this.photos.length;
  }

  next() {
    this.setCurrent(this.current + 1, 'left');
  }

  prev() {
    this.setCurrent(this.current - 1, 'right');
  }

  goTo(index: number) {
    const direction = index > this.current ? 'left' : 'right';
    this.setCurrent(index, direction);
    if (!this.isFullscreen) this.restartAutoplay();
  }

  private startAutoplay() {
    this.stopAutoplay();

    this.intervalId = setInterval(() => {
      if (this.isFullscreen) return;

      this.next();

      // forza Angular ad aggiornare la view
      this.cdr.detectChanges();

    }, this.AUTOPLAY_DELAY);
  }

  private stopAutoplay() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private restartAutoplay(pause: number = this.RESTART_DELAY) {
    this.stopAutoplay();
    setTimeout(() => this.startAutoplay(), pause);
  }

  trackByIndex(index: number): number {
    return index;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isFullscreen) {
      this.closeFullscreen();
    }
  }
}