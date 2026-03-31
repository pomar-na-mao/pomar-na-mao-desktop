import { signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { LoadingService } from '../../../data/services/loading';
import { MessageService } from '../../../data/services/message/message.service';
import type { LoginFormControl } from './login-form';
import { LoginViewModel } from './login.view-model';

describe('LoginViewModel', () => {
  let viewModel: LoginViewModel;

  const loadingSignal = signal(false);

  const mockRouter = {
    navigateByUrl: vi.fn()
  };

  const mockAuthenticationRepository = {
    loginUserHandler: vi.fn(),
    getUser: vi.fn()
  };

  const mockTranslateService = {
    instant: vi.fn((key: string) => key)
  };

  const mockMessageService = {
    error: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    loadingSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        LoginViewModel,
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationRepository, useValue: mockAuthenticationRepository },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: { isLoading: loadingSignal } }
      ]
    });

    viewModel = TestBed.inject(LoginViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should login successfully and navigate to home', async () => {
    mockAuthenticationRepository.loginUserHandler.mockResolvedValue({ error: null });
    mockAuthenticationRepository.getUser.mockResolvedValue({ user: { id: 'user-1' } });

    await viewModel.loginHandler('user@example.com', 'secret');

    expect(mockAuthenticationRepository.loginUserHandler).toHaveBeenCalledWith('user@example.com', 'secret');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/pomar-na-mao/home');
    expect(mockAuthenticationRepository.getUser).toHaveBeenCalled();
    expect(mockMessageService.error).not.toHaveBeenCalled();
    expect(loadingSignal()).toBe(false);
  });

  it('should show an error when credentials are invalid', async () => {
    mockAuthenticationRepository.loginUserHandler.mockResolvedValue({ error: { message: 'invalid' } });

    await viewModel.loginHandler('user@example.com', 'wrong-password');

    expect(mockTranslateService.instant).toHaveBeenCalledWith('PAGES.LOGIN.INVALID_CREDENTIALS');
    expect(mockMessageService.error).toHaveBeenCalledWith('PAGES.LOGIN.INVALID_CREDENTIALS');
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    expect(mockAuthenticationRepository.getUser).not.toHaveBeenCalled();
    expect(loadingSignal()).toBe(false);
  });

  it('should throw when the login form is invalid', () => {
    const invalidForm = new FormGroup<LoginFormControl>({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)]
      })
    });

    expect(() => viewModel.checkLoginFormCredentials(invalidForm)).toThrow();
    expect(loadingSignal()).toBe(false);
  });
});
