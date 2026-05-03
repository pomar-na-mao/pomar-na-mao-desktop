import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { Input } from '../../../../shared/components/input/input';
import { createLoginForm, emailErrors, passwordErrors, type LoginFormValue } from '../../../view-models/authentication/login-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, Input],
  templateUrl: './login.html',
  providers: [LoginViewModel],
})
export class Login {
  public loginViewModel = inject(LoginViewModel);

  public loginForm = createLoginForm();

  public emailErrors = emailErrors();

  public passwordErrors = passwordErrors();

  public async loginHandler(): Promise<void> {
    this.loginForm.markAllAsTouched();
    const { email, password } = this.loginForm.value as LoginFormValue;
    this.loginViewModel.checkLoginFormCredentials(this.loginForm);
    await this.loginViewModel.loginHandler(email, password);
  }
}
