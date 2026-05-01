import { Component, inject } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginViewModel } from './login.view-model';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, InputComponent],
  templateUrl: './login.component.html',
  providers: [LoginViewModel], // ViewModel provided here for component-specific state
})
export class LoginComponent {
  // View exposes the ViewModel
  public vm = inject(LoginViewModel);

  // Helper for template validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vm.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
