/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Routes } from '@angular/router';
import { Home } from '../../ui/views/home/home';
import { InspectRoutines } from '../../ui/views/inspect-routines/inspect-routines';
import { InspectAnnotations } from '../../ui/views/inspect-annotations/inspect-annotations';
import { PageNotFound } from '../../shared/components';

export default [
  { path: 'home', component: Home },
  { path: 'inspect-routines', component: InspectRoutines },
  { path: 'inspect-annotations', component: InspectAnnotations },
  { path: 'notfound', component: PageNotFound },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
