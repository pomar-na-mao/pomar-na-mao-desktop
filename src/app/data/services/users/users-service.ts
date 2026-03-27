import { Injectable } from '@angular/core';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { IUser } from '../../../domain/models/auth.model';
import { injectSupabase } from '../supabase';

export interface IUsersService {
  getUserData(userId: string): Promise<PostgrestSingleResponse<IUser>>;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService implements IUsersService {
  public supabase = injectSupabase();

  public async getUserData(userId: string): Promise<PostgrestSingleResponse<IUser>> {
    return await this.supabase.from('users').select('*').eq('id', userId).single();
  }
}
