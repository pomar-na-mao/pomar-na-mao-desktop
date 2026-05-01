export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Editor' | 'Visualizador';
  avatar?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
