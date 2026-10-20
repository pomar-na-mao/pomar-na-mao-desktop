import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'visao-geral',
    pathMatch: 'full',
  },
  {
    path: 'visao-geral',
    loadComponent: () =>
      import('../dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'variedades',
    loadComponent: () =>
      import('../varieties/varieties').then((m) => m.Varieties),
  },
  {
    path: 'ocorrencias',
    loadComponent: () =>
      import('../occurrences/occurrences').then((m) => m.Occurrences),
  },
] as Routes;
