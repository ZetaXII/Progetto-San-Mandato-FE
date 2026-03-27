import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Catalogo } from './catalogo/catalogo';
import { Mappa } from './mappa/mappa';

export const routes: Routes = [
  { path: '', component: Home },            // home page
  { path: 'catalogo', component: Catalogo },    // catalogo
  { path: 'mappa', component: Mappa },      // mappa
  { path: '**', redirectTo: '' }            // redirect per url sconosciuti
];
