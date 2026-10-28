import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: '/visao-geral',
    pathMatch: 'full',
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
  {
    path: 'zonas',
    loadComponent: () =>
      import('../zone-map-management/zone-map-management').then(
        (m) => m.ZoneMapManagement,
      ),
  },
   {
    path: 'insumos',
    loadComponent: () => import('../inputs/inputs').then((m) => m.Inputs),
  },
  {
    path: 'infraestrutura',
    loadComponent: () =>
      import('../infrastructure/infrastructure').then(
        (m) => m.Infrastructure,
      ),
  },
  {
    path: 'maquinas',
    loadComponent: () =>
      import('../machines/machines').then((m) => m.Machines),
  },
] as Routes;
