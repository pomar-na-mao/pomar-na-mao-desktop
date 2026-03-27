/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';

export const isAdminGuard: CanActivateFn = async (_route, _state) => {
  const userRolesRepository = inject(UserRolesRepository);

  const router = inject(Router);

  if (userRolesRepository.isUserAdmin()) {
    return true;
  } else {
    router.navigateByUrl('/plataforma-ipr/painel');
    return false;
  }
};
