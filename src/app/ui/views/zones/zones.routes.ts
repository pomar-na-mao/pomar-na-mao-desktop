import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'cadastro',
    pathMatch: 'full',
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('../zone-map-management/zone-map-management').then((m) => m.ZoneMapManagement),
  },
  {
    path: 'atribuicao',
    loadComponent: () =>
      import('../zone-assignment/zone-assignment').then((m) => m.ZoneAssignment),
  },
] as Routes;
