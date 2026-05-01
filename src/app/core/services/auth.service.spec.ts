import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    // Clear localStorage before creating the service
    localStorage.clear();
    
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should authenticate with valid credentials', () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    const result = service.login(email, password);
    
    expect(result).toBeTruthy();
    expect(service.isAuthenticated()).toBeTruthy();
    expect(service.currentUser()).toBeTruthy();
    expect(service.currentUser()?.email).toBe(email);
    expect(localStorage.getItem('auth_token')).toBe('simulated-jwt-token');
  });

  it('should not authenticate with short email or password', () => {
    const result = service.login('a@b.c', '123');
    expect(result).toBeFalsy();
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should logout correctly', () => {
    service.login('test@example.com', 'password123');
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
