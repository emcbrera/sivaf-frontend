import { Routes } from '@angular/router';
import { authGuard, authMatchGuard } from './core/guards/auth.guard';
import {
  academicRoleGuard,
  academicRoleMatchGuard,
} from './core/guards/role.guard';
import { Login } from './features/auth/pages/login/login';
import { RecoverPassword } from './features/auth/pages/recover-password/recover-password';
import { MainLayout } from './layout/pages/main-layout/main-layout';
<<<<<<< HEAD

=======
>>>>>>> dd59c6e57bd6f579241f8f808bb2a04915754bbf

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'recover-password',
    component: RecoverPassword
  },
  {
    path: '',
    component: MainLayout,
    canMatch: [authMatchGuard],
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'photo-upload-home',
        canMatch: [academicRoleMatchGuard],
        canActivate: [academicRoleGuard],
        loadComponent: () =>
          import('./features/photo-upload/pages/photo-upload-home/photo-upload-home')
<<<<<<< HEAD
            .then(m => m.PhotoUploadHome)
      },
      
=======
            .then((module) => module.PhotoUploadHome)
      }
>>>>>>> dd59c6e57bd6f579241f8f808bb2a04915754bbf
    ]
  }
];
