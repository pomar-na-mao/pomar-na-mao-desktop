import { Routes } from '@angular/router';
import { isLoggedGuard } from './core/guards/is-logged/is-logged.guard';

export const ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./ui/views/authentication/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./ui/views/layout/layout').then(m => m.AppLayoutComponent),
    canActivate: [isLoggedGuard],
    children: [
      {
        path: 'meu-pomar',
        loadComponent: () => import('./ui/views/my-orchard/my-orchard').then(m => m.MyOrchard)
      },
      {
        path: 'cadastro',
        loadComponent: () => import('./ui/views/registration/registration').then(m => m.Registration),
        children: [
          {
            path: '',
            loadChildren: () => import('./ui/views/registration/registration.routes')
          }
        ]
      },
      {
        path: 'inicio',
        redirectTo: 'meu-pomar',
      },
      {
        path: 'atividades-de-campo',
        children: [
          {
            path: '',
            redirectTo: 'realizadas',
            pathMatch: 'full'
          },
          {
            path: 'realizadas',
            loadComponent: () => import('./ui/views/completed-operations/completed-operations').then(m => m.CompletedOperations)
          },
          {
            path: 'gerar',
            loadComponent: () => import('./ui/views/generate-activity/generate-activity').then(m => m.GenerateActivity)
          }
        ]
      },
      {
        path: 'mpid',
        children: [
          {
            path: '',
            redirectTo: 'realizadas',
            pathMatch: 'full'
          },
          {
            path: 'realizadas',
            loadComponent: () => import('./ui/views/mipd/mipd-completed/mipd-completed').then(m => m.MipdCompleted)
          },
          {
            path: 'registrar',
            loadComponent: () => import('./ui/views/mipd/mipd-registration/mipd-registration').then(m => m.MipdRegistration)
          }
        ]
      },
      {
        path: 'mipd',
        redirectTo: 'mpid',
      },
      {
        path: 'mipd/realizadas',
        redirectTo: 'mpid/realizadas',
      },
      {
        path: 'mipd/registrar',
        redirectTo: 'mpid/registrar',
      },
      {
        path: 'registrar',
        children: [
          {
            path: 'ocorrencias',
            loadComponent: () => import('./ui/views/polygon-occurrences/polygon-occurrences').then(m => m.PolygonOccurrences)
          }
        ]
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./ui/views/settings/settings').then(m => m.Settings)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./ui/views/users/users').then(m => m.Users)
      },
      {
        path: '',
        redirectTo: 'meu-pomar',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
