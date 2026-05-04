import { Injectable, inject } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { LoadingService } from '../../../data/services/loading';
import { MessageService } from '../../../data/services/message/message.service';
import type { LoginFormControl } from './login-form';

@Injectable() // Not providedIn root, but provided in the component
export class LoginViewModel {
  public router = inject(Router);
  public authenticationRepository = inject(AuthenticationRepository);
  public loadingService = inject(LoadingService);
  public messageService = inject(MessageService);


  public async loginHandler(email: string, password: string): Promise<void> {
    this.loadingService.isLoading.set(true);

    const { error } = await this.authenticationRepository.loginUserHandler(email, password);

    if (error) {
      this.messageService.error("Dados inválidos!. Preencha email e senha corretamente!");
      this.loadingService.isLoading.set(false);

      return;
    }

    this.router.navigateByUrl('/home');

    await this.authenticationRepository.getUser();

    this.loadingService.isLoading.set(false);

    // TODO Mensagem de boas vindas
  }

  public checkLoginFormCredentials(loginForm: FormGroup<LoginFormControl>): void {
    if (!loginForm.valid) {
      //Mensagem de error

      this.loadingService.isLoading.set(false);

      throw new Error('Dados inválidos!. Preencha email e senha corretamente!');
    }
  }
}
