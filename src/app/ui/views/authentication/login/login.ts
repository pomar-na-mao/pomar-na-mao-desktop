import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { Input } from '../../../../shared/components/input/input';
import { createLoginForm, type LoginFormValue } from '../../../view-models/authentication/login-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, Input],
  templateUrl: './login.html',
  providers: [LoginViewModel], // ViewModel provided here for component-specific state
})
export class Login {
  public loginViewModel = inject(LoginViewModel);

  public loginForm = createLoginForm();

  public get emailErrors(): Record<string, string> {
    return {
      required: "Este campo é obrigatório",
      email: "E-mail inválido",
    };
  }

  public get passwordErrors(): Record<string, string> {
    return {
      required: "Este campo é obrigatório",
      minlength: "A senha deve ter pelo menos 3 caracteres",
    };
  }

  public async loginHandler(): Promise<void> {
    this.loginForm.markAllAsTouched();
    const { email, password } = this.loginForm.value as LoginFormValue;
    this.loginViewModel.checkLoginFormCredentials(this.loginForm);
    await this.loginViewModel.loginHandler(email, password);
  }
}
