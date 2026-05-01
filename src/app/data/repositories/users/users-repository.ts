import type { IUser } from '../../../domain/models/auth.model';
import { inject, Injectable, signal } from "@angular/core";
import { UsersService } from '../../services/users/users-service';


@Injectable({
  providedIn: 'root',
})
export class UsersRepository {
  private usersService = inject(UsersService);

  public currentUser = signal<IUser | null>(null);

  public async getUserData(userId: string): Promise<void> {
    const { data: userData } = await this.usersService.getUserData(userId);
    this.currentUser.set(userData);
  }
}
