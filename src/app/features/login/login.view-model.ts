import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { merge, map, startWith } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Injectable() // Not providedIn root, but provided in the component
export class LoginViewModel {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // State (Reactive Properties)
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  // The Form is part of the ViewModel in MVVM
  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Track form status as a signal
  private formStatus = toSignal(
    merge(this.loginForm.statusChanges, this.loginForm.valueChanges).pipe(
      map(() => this.loginForm.status),
      startWith(this.loginForm.status)
    ),
    { initialValue: 'INVALID' }
  );

  // Computed properties
  public isSubmitDisabled = computed(() => this.formStatus() !== 'VALID' || this.isLoading());

  constructor() {}

  async submit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { email, password } = this.loginForm.value;
    const success = this.authService.login(email, password);

    if (success) {
      this.router.navigate(['/home']);
    } else {
      this.errorMessage.set('E-mail ou senha inválidos. Tente novamente.');
      this.isLoading.set(false);
    }
  }
}
