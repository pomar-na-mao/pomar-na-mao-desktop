import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { AuthenticationRepository } from "../../../data/repositories/authentication/authentication-repository";
import { LoadingService } from "../../../data/services/loading";
import { LoginFormControl } from "./login-form";
import { MessageService } from "../../../data/services/message/message.service";
import { TranslateService } from "@ngx-translate/core";


@Injectable()
export class LoginViewModel {
  public router = inject(Router);
  public translate = inject(TranslateService);
  public authenticationRepository = inject(AuthenticationRepository);
  public loadingService = inject(LoadingService);
  public messageService = inject(MessageService);


  public async loginHandler(email: string, password: string): Promise<void> {
    this.loadingService.isLoading.set(true);

    const { error } = await this.authenticationRepository.loginUserHandler(email, password);

    if (error) {
      this.messageService.error(this.translate.instant('PAGES.LOGIN.INVALID_CREDENTIALS'));
      this.loadingService.isLoading.set(false);

      return;
    }

    this.router.navigateByUrl('/pomar-na-mao/home');

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
