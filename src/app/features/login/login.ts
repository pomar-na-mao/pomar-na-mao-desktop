import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginViewModel } from './login.view-model';
import { Input } from '../../shared/components/input/input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, Input],
  templateUrl: './login.html',
  providers: [LoginViewModel], // ViewModel provided here for component-specific state
})
export class Login {
  // View exposes the ViewModel
  public vm = inject(LoginViewModel);

  // Helper for template validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vm.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
