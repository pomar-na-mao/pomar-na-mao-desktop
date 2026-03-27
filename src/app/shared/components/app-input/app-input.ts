import { Component, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './app-input.html',
  host: { class: 'block' },
})
export class AppInput implements OnInit {
  @Input() public id = '';
  @Input() public type: 'text' | 'email' | 'password' = 'text';
  @Input() public label = '';
  @Input() public placeholder = '';
  @Input() public icon = '';
  @Input() public control: AbstractControl | null = null;
  @Input() public errorMessages: Record<string, string> = {};

  public showPassword = signal(false);
  public inputType = signal<'text' | 'email' | 'password'>('text');

  public ngOnInit(): void {
    this.inputType.set(this.type);
  }

  public get isInvalid(): boolean {
    return !!this.control?.invalid && !!(this.control?.dirty || this.control?.touched);
  }

  public get currentErrorMessage(): string | null {
    if (!this.isInvalid || !this.control?.errors) return null;

    const errorKey = Object.keys(this.control.errors)[0];
    return this.errorMessages[errorKey] ?? null;
  }

  public toggleVisibility(): void {
    const isVisible = !this.showPassword();
    this.showPassword.set(isVisible);
    this.inputType.set(isVisible ? 'text' : 'password');
  }

  public get isPasswordType(): boolean {
    return this.type === 'password';
  }
}
