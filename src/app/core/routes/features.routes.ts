/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Routes } from '@angular/router';
import { PageNotFound } from '../../shared/components';
import { Admin } from '../../ui/views/admin/admin';
import { AnnotationDetail } from '../../ui/views/annotation-detail/annotation-detail';
import { Home } from '../../ui/views/home/home';
import { MassInclusion } from '../../ui/views/mass-inclusion/mass-inclusion';
import { RoutineDetail } from '../../ui/views/routine-detail/routine-detail';
import { SprayingFlow } from '../../ui/views/spraying-flow/spraying-flow';
import { Syncs } from '../../ui/views/syncs/syncs';
import { isAdminGuard } from '../guards/is-admin/is-admin.guard';

export default [
  { path: 'home', component: Home },
  { path: 'sincronizacoes', component: Syncs },
  { path: 'sincronizacoes/rotinas/:id', component: RoutineDetail },
  { path: 'fluxo-pulverizacao', component: SprayingFlow },
  {
    path: 'sincronizacoes/anotacoes-de-inspecao/:id',
    component: AnnotationDetail,
  },
  { path: 'inclusoes-em-massa', component: MassInclusion },
  { path: 'administracao', component: Admin, canActivate: [isAdminGuard] },
  { path: 'notfound', component: PageNotFound },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
