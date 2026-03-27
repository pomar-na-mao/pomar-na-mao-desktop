import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { AuthenticationRepository } from '../../../../data/repositories/authentication/authentication-repository';
import { LoadingService } from '../../../../data/services/loading';
import { MessageService } from '../../../../data/services/message/message.service';
import { TranslateModule } from '@ngx-translate/core';


describe('Login (vitest)', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  beforeEach(async () => {
    vi.clearAllMocks();

    const mockAuthRepository = {
      loginUserHandler: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
    } as Partial<AuthenticationRepository> as AuthenticationRepository;

    const mockMessageService = {
      show: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      hide: vi.fn(),
    } as Partial<MessageService> as MessageService;

    await TestBed.configureTestingModule({
      imports: [Login, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        LoadingService,
        { provide: AuthenticationRepository, useValue: mockAuthRepository },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loginHandler should validate form and delegate to LoginViewModel with form values', async () => {
    const email = 'test@example.com';
    const password = 'secret';

    const loginViewModel = component.loginViewModel;
    const checkLoginFormCredentialsSpy = vi.spyOn(loginViewModel, 'checkLoginFormCredentials');
    const loginHandlerSpy = vi.spyOn(loginViewModel, 'loginHandler').mockResolvedValue();

    component.loginForm.setValue({ email, password });

    await component.loginHandler();

    expect(checkLoginFormCredentialsSpy).toHaveBeenCalledWith(component.loginForm);
    expect(loginHandlerSpy).toHaveBeenCalledWith(email, password);
  });
});

