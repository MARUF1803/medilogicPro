import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const MVC_LOGIN_URL = 'http://localhost:5050/Account/Login';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const branchId = localStorage.getItem('activeBranchId');

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (branchId) {
    headers = headers.set('X-Branch-ID', branchId);
  }

  return next(req.clone({ headers })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeBranchId');
        window.location.href = `${MVC_LOGIN_URL}?expired=true`;
      }
      return throwError(() => error);
    })
  );
};
