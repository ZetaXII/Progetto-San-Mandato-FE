import { Injectable, createComponent, EnvironmentInjector, ApplicationRef } from '@angular/core';
import { ConfirmationModal } from '../../app/confirmation-modal/confirmation-modal';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  confirm(options: { 
    titolo?: string; 
    messaggio: string; 
    testoProcedi?: string; 
    testoAnnulla?: string; 
  }): Promise<boolean> {
    return new Promise((resolve) => {
      // Crea il componente dinamicamente
      const componentRef = createComponent(ConfirmationModal, {
        environmentInjector: this.injector
      });

      // Assegna gli input se forniti
      if (options.titolo !== undefined) componentRef.instance.titolo = options.titolo;
      componentRef.instance.messaggio = options.messaggio;
      if (options.testoProcedi !== undefined) componentRef.instance.testoProcedi = options.testoProcedi;
      if (options.testoAnnulla !== undefined) componentRef.instance.testoAnnulla = options.testoAnnulla;

      // Collega la vista all'ApplicationRef per il change detection
      this.appRef.attachView(componentRef.hostView);

      // Aggiunge l'elemento DOM al body
      const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      const cleanup = (value: boolean) => {
        resolve(value);
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      // Sottoscrizione agli eventi della modale
      componentRef.instance.conferma.subscribe(() => cleanup(true));
      componentRef.instance.annulla.subscribe(() => cleanup(false));
    });
  }
}
