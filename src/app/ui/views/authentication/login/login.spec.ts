import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  const loginViewModel = {
    loadingService: {
      isLoading: signal(false),
    },
    messageService: {
      currentMessage: signal<{ type: string; text: string } | null>(null),
      showMessage: signal(false),
    },
    checkLoginFormCredentials: vi.fn(),
    loginHandler: vi.fn(),
  };

  beforeEach(async () => {
    loginViewModel.loadingService.isLoading.set(false);
    loginViewModel.messageService.currentMessage.set(null);
    loginViewModel.messageService.showMessage.set(false);
    await TestBed.configureTestingModule({
      imports: [Login],
    })
      .overrideComponent(Login, {
        set: {
          providers: [{ provide: LoginViewModel, useValue: loginViewModel }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should toggle password visibility without changing its value', async () => {
    component.loginForm.controls.password.setValue('secret123');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector<HTMLInputElement>(
      'app-input input[type="password"]',
    );
    const visibilityButton = compiled.querySelector<HTMLButtonElement>(
      'button[aria-label="Mostrar senha"]',
    );

    expect(passwordInput?.type).toBe('password');
    expect(passwordInput?.value).toBe('secret123');

    visibilityButton?.click();
    await fixture.whenStable();

    expect(passwordInput?.type).toBe('text');
    expect(passwordInput?.value).toBe('secret123');
    expect(
      compiled.querySelector('button[aria-label="Ocultar senha"]'),
    ).toBeTruthy();
  });

  it('should keep assistance buttons inert', async () => {
    const submitSpy = vi.spyOn(component, 'loginHandler');
    const compiled = fixture.nativeElement as HTMLElement;
    const assistanceButtons = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('button'),
    ).filter((button) =>
      ['Esqueceu a senha?', 'Contate o administrador'].includes(
        button.textContent?.trim() ?? '',
      ),
    );

    expect(assistanceButtons).toHaveLength(2);

    assistanceButtons.forEach((button) => button.click());
    await fixture.whenStable();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('keeps the 60/40 desktop split and a single-column mobile form', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.hidden.lg\\:block.lg\\:w-\\[60\\%\\]')).toBeTruthy();
    expect(root.querySelector('.w-full.lg\\:w-\\[40\\%\\]')).toBeTruthy();
  });

  it('disables the shared submit button while loading', () => {
    loginViewModel.loadingService.isLoading.set(true);
    fixture.detectChanges();
    const submit = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submit?.disabled).toBe(true);
    expect(submit?.classList.contains('ui-btn')).toBe(true);
    expect(submit?.textContent).toContain('Entrando');
  });

  it('renders an accessible semantic error alert', () => {
    loginViewModel.messageService.currentMessage.set({ type: 'error', text: 'Credenciais inválidas' });
    loginViewModel.messageService.showMessage.set(true);
    fixture.detectChanges();
    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.classList.contains('ui-alert')).toBe(true);
    expect(alert?.textContent).toContain('Credenciais inválidas');
  });
});
