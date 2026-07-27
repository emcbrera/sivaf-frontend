import { AuthRole } from './auth-role.model';

export interface LoginResponse {
  codigo: 200;
  mensaje: string;
  primernombre: string;
  segundonombre: string | null;
  primerapellido: string;
  segundoapellido: string | null;
  email: string;
  identificacion: string;
  TokenInterno: string;
  roles: AuthRole[];
}
