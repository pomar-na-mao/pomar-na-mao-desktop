import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { CustomValidationMessageComponent } from '../../../components/shared/custom-validation-message/custom-validation-message';
import {
  createLoginForm,
  type LoginFormValue,
} from '../../../view-models/authentication/login-form';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    ReactiveFormsModule,
    CustomValidationMessageComponent,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [LoginViewModel],
})
export class Login {
  public loginViewModel = inject(LoginViewModel);

  public loginForm = createLoginForm();

  public async loginHandler(): Promise<void> {
    this.loginForm.markAllAsTouched();
    const { email, password } = this.loginForm.value as LoginFormValue;
    this.loginViewModel.checkLoginFormCredentials(this.loginForm);
    await this.loginViewModel.loginHandler(email, password);
  }
}
