import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authReady()) return true;
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: router.url },
  });
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authReady()) return true;
  if (auth.isAuthenticated() && auth.isAdmin()) return true;
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/admin/login'], {
      queryParams: { redirect: router.url },
    });
  }
  return router.createUrlTree(['/']);
};
