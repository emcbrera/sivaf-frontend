import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { RecoverPassword } from './features/auth/pages/recover-password/recover-password';

export const routes: Routes = [
    {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component:Login
  },
  {
    path: 'recover-password',
    component:RecoverPassword
  }
];
