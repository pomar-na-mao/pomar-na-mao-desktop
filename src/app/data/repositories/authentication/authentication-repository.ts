import { Session, User, type UserResponse } from '@supabase/supabase-js';
import type { ILoginResponse, ILogoutResponse, IResetPasswordResponse } from '../../../domain/models/auth.model';
import { computed, inject, Injectable, signal } from "@angular/core";
import { AuthenticationService } from '../../services/authentication/authentication-service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationRepository {
  private authenticationService = inject(AuthenticationService);

  public currentSession = signal<Session | null>(null);
  public user = signal<User | null>(null);
  public isInitialized = signal<boolean>(false);

  public isUserLogged = computed(() => !!this.currentSession());

  constructor() {
    this.init();
  }

  private init(): void {
    this.authenticationService.authChanges((event, session) => {
      this.currentSession.set(session);
      this.user.set(session?.user ?? null);
      this.isInitialized.set(true);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        console.log('Auth state synchronized:', event);
      }
    });
  }

  public async loginUserHandler(email: string, password: string): Promise<ILoginResponse> {
    return await this.authenticationService.loginUserHandler(email, password);
  }

  public async forgotPasswordHandler(email: string): Promise<IResetPasswordResponse> {
    return await this.authenticationService.forgotPasswordHandler(email);
  }

  public async resetPasswordHandler(password: string): Promise<UserResponse> {
    return await this.authenticationService.resetPasswordHandler(password);
  }

  public async getSession(): Promise<void> {
    const { data } = await this.authenticationService.getSession();
    if (data?.session) {
      this.currentSession.set(data.session);
      this.user.set(data.session.user);
    }
    this.isInitialized.set(true);
  }

  public async getUser(): Promise<void> {
    const { data, error } = await this.authenticationService.getUser();
    if (!error && data.user) this.user.set(data.user);
  }

  public async signOut(): Promise<ILogoutResponse> {
    const { error } = await this.authenticationService.signOut();
    this.currentSession.set(null);
    this.user.set(null);
    return { error }
  }
}
