import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuditTrail } from 'src/app/libs/models/audit-trail.model';
import { ApiService } from 'src/app/libs/services';
// import {AuditTrail, AuditTrailResponse} from '../_models/audit-trail.model';

const API_DATASETS_URL = 'api/audit-trail';

@Injectable()
export class AuditTrailService {
  constructor(private _apicall: ApiService, private router: Router, private serializer: UrlSerializer) {}

  public loadAuditTrail(
    userId?: string,
    page?: 'application' | 'data_visualization' | 'data_processing' | 'menu_builder'
  ): Observable<AuditTrail[]> {
    const tree = this.router.createUrlTree([], { queryParams: { user_id: userId, page } });
    let queryParam = this.serializer.serialize(tree);
    return this._apicall.get(`${API_DATASETS_URL}?${queryParam}`).pipe(
      map((value) => value.response),
      map((value) => {
        return value.map((v) => {
          v.logged_at = new Date((v.logged_at as number) * 1000);

          if (page === 'application') {
            const regex = new RegExp('(.*)(from application (.*))', 'g');
            const regexResult = regex.exec(v.text);
            if (regexResult) {
              v.application = regexResult[3];
              v.text = regexResult[1];
            }
          }
          return v;
        });
      }),
      catchError(this.handleError('load-audit-trail'))
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
      return of(result);
    };
  }
}
