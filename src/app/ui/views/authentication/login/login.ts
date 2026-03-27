import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { createLoginForm, LoginFormValue } from '../../../../ui/view-models/authentication/login-form';
import { LoginViewModel } from '../../../../ui/view-models/authentication/login.view-model';
import { AppInput, AppButton } from '../../../../shared/components';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    AppInput,
    AppButton,
  ],
  providers: [LoginViewModel],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  public leaves = new Array(12).fill(0).map(() => ({
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 5 + 's',
    duration: Math.random() * 10 + 10 + 's',
    size: Math.random() * 20 + 20 + 'px',
    opacity: Math.random() * 0.4 + 0.1
  }));

  private translate = inject(TranslateService);
  public loginViewModel = inject(LoginViewModel);

  public loginForm = createLoginForm();

  public get emailErrors(): Record<string, string> {
    return {
      required: this.translate.instant('PAGES.LOGIN.ERROR_REQUIRED'),
      email: this.translate.instant('PAGES.LOGIN.ERROR_EMAIL'),
    };
  }

  public get passwordErrors(): Record<string, string> {
    return {
      required: this.translate.instant('PAGES.LOGIN.ERROR_REQUIRED'),
      minlength: this.translate.instant('PAGES.LOGIN.ERROR_MINLENGTH'),
    };
  }

  public async loginHandler(): Promise<void> {
    this.loginForm.markAllAsTouched();
    const { email, password } = this.loginForm.value as LoginFormValue;
    this.loginViewModel.checkLoginFormCredentials(this.loginForm);
    await this.loginViewModel.loginHandler(email, password);
  }
}
