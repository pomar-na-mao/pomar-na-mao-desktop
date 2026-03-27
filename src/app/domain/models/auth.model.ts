/* eslint-disable @typescript-eslint/naming-convention */
import { Session, User, AuthError, type WeakPassword, type Subscription } from '@supabase/supabase-js';

export interface IAuthCredentials {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface ILoginResponse {
  data: {
    user: User;
    session: Session;
    weakPassword?: WeakPassword;
  } | {
    user: null;
    session: null;
    weakPassword?: null | undefined;
  }; error: AuthError | null;
}

export interface IResetPasswordResponse {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  data: {} | null;
  error: AuthError | null;
}

export interface IUserSessionResponse {
  data: { session: Session | null; };
  error: AuthError | null;
}

export interface ILogoutResponse { error: AuthError | null; }

export interface IUser {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  isAdmin: boolean;
}

export interface IUserRole { user_id: string, role: string }

export interface AuthChangesResponse { data: { subscription: Subscription }; }

