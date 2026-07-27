import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { Input } from '../../../../shared/components/input/input';
import {
  createLoginForm,
  emailErrors,
  passwordErrors,
  type LoginFormValue,
} from '../../../view-models/authentication/login-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Input],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [LoginViewModel],
})
export class Login {
  public loginViewModel = inject(LoginViewModel);

  public loginForm = createLoginForm();

  public emailErrors = emailErrors();

  public passwordErrors = passwordErrors();

  public passwordVisible = signal(false);

  public togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  public async loginHandler(): Promise<void> {
    this.loginForm.markAllAsTouched();
    const { email, password } = this.loginForm.value as LoginFormValue;
    this.loginViewModel.checkLoginFormCredentials(this.loginForm);
    await this.loginViewModel.loginHandler(email, password);
  }
}
