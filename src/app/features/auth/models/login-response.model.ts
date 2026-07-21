import { AuthRole } from './auth-role.model';

export interface LoginResponse {
  codigo: 200;
  mensaje: string;
  identificacion: string;
  TokenInterno: string;
  roles: AuthRole[];
}
