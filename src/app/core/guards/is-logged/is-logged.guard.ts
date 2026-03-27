/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';
import { UsersRepository } from '../../../data/repositories/users/users-repository';


export const isLoggedGuard: CanActivateFn = async (_route, _state) => {
  const authenticationRepository = inject(AuthenticationRepository);

  const usersRepository = inject(UsersRepository);

  const userRolesRepository = inject(UserRolesRepository);

  const router = inject(Router);

  await authenticationRepository.getSession();

  if (!authenticationRepository.isUserLogged()) {
    router.navigateByUrl('/login');
    return false;
  }

  const userId = authenticationRepository.currentSession()?.user.id;
  if (userId) {
    await userRolesRepository.getUserRoleData(userId);
    await usersRepository.getUserData(userId);
  }

  return true;
};
