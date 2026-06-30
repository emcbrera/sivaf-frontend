import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { RecoverPassword } from './features/auth/pages/recover-password/recover-password';
import { MainLayout } from './layout/pages/main-layout/main-layout';
import { PhotoHistory } from './features/photo-history/pages/photo-history/photo-history';

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
    children: [
      {
        path: 'photo-upload',
        loadComponent: () =>
          import('./features/photo-upload/pages/photo-upload-home/photo-upload-home')
            .then(m => m.PhotoUploadHome)
      },
      {
       path: 'photo-history',
       component: PhotoHistory
      }
    ]
  }
];
