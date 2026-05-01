import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(this.loadStoredUser());
  private tokenSignal = signal<string | null>(localStorage.getItem('auth_token'));

  // ViewModel can consume these computed signals
  public currentUser = computed(() => this.userSignal());
  public isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (email.length > 3 && password.length > 3) {
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'Administrador',
        status: 'Ativo',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff'
      };

      localStorage.setItem('auth_token', 'simulated-jwt-token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      this.tokenSignal.set('simulated-jwt-token');
      this.userSignal.set(mockUser);
      
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private loadStoredUser(): User | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }
}
