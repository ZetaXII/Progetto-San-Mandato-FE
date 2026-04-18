import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertData, AlertType } from '../entities/popupAlertEntities';

@Injectable({ providedIn: 'root' })
export class PopupAlertService {
  private alertSubject = new BehaviorSubject<AlertData>({
    title: '',
    message: '',
    type: 0,
    visible: false
  });

  alert$ = this.alertSubject.asObservable();

  private timeoutRef: any = null;

  show(title: string, message: string, type: AlertType = 0, duration = 4000) {

    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    this.alertSubject.next({
      title,
      message,
      type,
      visible: true
    });

    this.timeoutRef = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    this.alertSubject.next({
      ...this.alertSubject.value,
      visible: false
    });
  }
}