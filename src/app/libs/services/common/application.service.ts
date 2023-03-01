import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GetApplicationListResponse, Application, GetApplicationResponse } from 'src/app/libs/models/application.model';
import { GetMenuResponse, Menu } from 'src/app/libs/models/menu.model';

const API_APPLICATION_URL = 'api/applications';
const API_PUBLIC_APPLICATION_URL = 'api/public/applications';

@Injectable()
export class ApplicationService {
  constructor(private http: HttpClient) {}

  public getApplicationList(): Observable<Application[]> {
    return this.http.get<GetApplicationListResponse>(`${API_APPLICATION_URL}`).pipe(
      map((value) => value.response),
      catchError(this.handleError('load-application-list'))
    );
  }

  public getApplicationBySlug(slug: string): Observable<Application> {
    return this.http.get<GetApplicationResponse>(`${API_APPLICATION_URL}/${slug}`).pipe(
      map((value) => value.response),
      catchError(this.handleError('load-application'))
    );
  }

  public getPublicApplicationBySlug(slug: string): Observable<Application> {
    return this.http.post<GetApplicationResponse>(`${API_PUBLIC_APPLICATION_URL}/${slug}`, {}).pipe(
      map((value) => value.response),
      catchError(this.handleError('load-public-application'))
    );
  }

  public getApplicationMenu(slug: string, menuId: string, password?: string): Observable<Menu> {
    return this.http
      .get<GetMenuResponse>(`${API_APPLICATION_URL}/${slug}/menu/${menuId}?${password ? 'password=' + password : ''}`)
      .pipe(
        map((value) => value.response),
        catchError(this.handleError('load-application-menu'))
      );
  }

  /*
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return result ? of(result) : throwError(error);
    };
  }
}
