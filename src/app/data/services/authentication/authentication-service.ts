import { inject, Injectable } from "@angular/core";
import type { AuthChangeEvent, AuthTokenResponsePassword, Session, UserResponse } from "@supabase/supabase-js";
import type { AuthChangesResponse, ILogoutResponse, IResetPasswordResponse, IUserSessionResponse } from "../../../domain/models/auth.model";
import { injectSupabase } from "../supabase";
import { SupabaseRequestCacheService } from "../supabase-request-cache/supabase-request-cache.service";

export interface IAuthenticationService {
  loginUserHandler(email: string, password: string): Promise<AuthTokenResponsePassword>;
  forgotPasswordHandler(email: string): Promise<IResetPasswordResponse>;
  resetPasswordHandler(password: string): Promise<UserResponse>;
  getSession(): Promise<IUserSessionResponse>;
  signOut(): Promise<ILogoutResponse>;
  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): AuthChangesResponse
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements IAuthenticationService {

  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async loginUserHandler(email: string, password: string): Promise<AuthTokenResponsePassword> {
    const response = await this.supabase.auth.signInWithPassword({ email, password });
    if (!response.error) {
      this.requestCache.clear();
    }
    return response;
  }

  public async forgotPasswordHandler(email: string): Promise<IResetPasswordResponse> {
    return await this.supabase.auth.resetPasswordForEmail(email);
  }

  public async resetPasswordHandler(password: string): Promise<UserResponse> {
    return await this.supabase.auth.updateUser({ password });
  }

  public async getSession(): Promise<IUserSessionResponse> {
    return await this.supabase.auth.getSession();
  }

  public async getUser(): Promise<UserResponse> {
    return await this.supabase.auth.getUser()
  }

  public async signOut(): Promise<ILogoutResponse> {
    const response = await this.supabase.auth.signOut();
    if (!response.error) {
      this.requestCache.clear();
    }
    return response;
  }


  public authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): AuthChangesResponse {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        this.requestCache.clear();
      }
      callback(event, session);
    })
  }
}
