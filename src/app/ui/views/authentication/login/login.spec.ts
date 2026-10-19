import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginViewModel } from '../../../view-models/authentication/login.view-model';
import { Login } from './login';

describe('Login Component', () => {
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
    vi.clearAllMocks();

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
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with email and password controls', () => {
    expect(component.loginForm.contains('email')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
    expect(component.loginForm.valid).toBe(false);
  });

  it('should render email, password and submit button elements', () => {
    const root = fixture.nativeElement as HTMLElement;
    const emailInput = root.querySelector('#emailField');
    const passwordComponent = root.querySelector('#passwordField');
    const loginButton = root.querySelector('#loginButton');

    expect(emailInput).toBeTruthy();
    expect(passwordComponent).toBeTruthy();
    expect(loginButton).toBeTruthy();
  });

  it('should call loginHandler on ViewModel when loginHandler is triggered', async () => {
    component.loginForm.setValue({
      email: 'user@pomarnamao.com',
      password: 'mypassword123',
    });

    await component.loginHandler();

    expect(loginViewModel.checkLoginFormCredentials).toHaveBeenCalledWith(component.loginForm);
    expect(loginViewModel.loginHandler).toHaveBeenCalledWith('user@pomarnamao.com', 'mypassword123');
  });

  it('should reflect loading state on login button', () => {
    loginViewModel.loadingService.isLoading.set(true);
    fixture.detectChanges();
    const loginBtn = fixture.nativeElement.querySelector('#loginButton');
    expect(loginBtn?.getAttribute('ng-reflect-loading') || loginBtn?.classList.contains('p-button-loading') || loginBtn?.querySelector('.p-button-loading-icon')).toBeTruthy();
  });
});
