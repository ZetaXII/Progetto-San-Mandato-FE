import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { Footer } from "./footer/footer";
import { Navbar } from './navbar/navbar';
import { PopupAlert } from './popup-alert/popup-alert';
import { PopupAlertService } from '../assets/services/popup-alert-service';
import { AlertData } from '../assets/entities/popupAlertEntities';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule, PopupAlert, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  showFooter = false;
  alert$: Observable<AlertData>;

  constructor(
    private router: Router,
    private alertService: PopupAlertService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Mostra footer solo su home
        this.showFooter = event.url === '/' || event.url === '/home';
      });

    this.alert$ = this.alertService.alert$
  }
}
