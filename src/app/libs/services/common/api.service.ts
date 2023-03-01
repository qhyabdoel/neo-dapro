import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from 'src/app/components/modals/modal/modal.component';
import { AppState } from 'src/app/libs/store/states';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public requestUrl: string;
  public responseData: any;
  public handleError: any;
  public authToken: string;

  private _options: any;
  cookieValue: string;

  constructor(private http: HttpClient, private httpFile: HttpClient, private modalService: NgbModal) {}

  post(url, data: any = null, options: any = {}): Observable<any> {
    if (!options) {
      options = {};
    }

    return this.http.post<any[]>(url, data, options);
  }

  postFormData(url, data: string) {
    return this.http.post<any[]>(url, { form_data: String(data) });
  }

  put(url, data: any = null): Observable<any> {
    return this.http.put<any[]>(url, data);
  }

  get(url, type?): Observable<any> {
    // if (type === 'download') {
    //   this._options = { ...this._options, responseType: 'blob' };
    // }
    // return this.http.get<any[]>(url, this._options);
    if (type === 'download') {
      this._options = { ...this._options, responseType: 'blob' };
    }
    return this.http.get<any[]>(url);
  }

  delete(url): Observable<any> {
    return this.http.delete<any[]>(url);
  }

  gets(url, data) {
    return this.http.get(url, data);
  }

  ForkJoin(obj: object) {
    let observableBatch = [];
    let rx = this;
    Object.keys(obj).forEach(function (key) {
      //console.log(key, obj[key].url, obj[key].data, obj[key].method);
      if (obj[key].method == 'post') observableBatch.push(rx.http.post(obj[key].url, obj[key].data));
      if (obj[key].method == 'get') observableBatch.push(rx.http.get(obj[key].url));
    });
    return forkJoin(observableBatch);
  }

  uploadFile(url, formData) {
    return this.httpFile.post(url, formData);
  }

  async getApi(url, isWithModalMessasge?) {
    return await this.get(url)
      .toPromise()
      .then(
        (result) => {
          if (isWithModalMessasge) {
            this.openModal('Success', 'This action sucessfully to process!');
          }
          return {
            status: true,
            result: result,
          };
        },
        (err) => {
          if (isWithModalMessasge) this.openModal('Failed', 'This action failed to process!');
          return {
            status: false,
            result: err,
          };
        }
      );
  }

  async postApi(url, param, isWithModalMessasge?) {
    return await this.post(url, param)
      .toPromise()
      .then(
        (result) => {
          if (isWithModalMessasge) {
            this.openModal('Success', 'This action sucessfully to process!');
          }
          return {
            status: true,
            result: result,
            msg: result,
          };
        },
        (err) => {
          if (isWithModalMessasge) {
            this.openModal(
              'Failed',
              'This action failed to process! ' + (err.error['message'] ? '\n messasge : ' + err.error['message'] : '')
            );
          }
          return {
            status: false,
            result: err,
            msg: err,
          };
        }
      );
  }

  async deleteApi(url, isWithModalMessasge) {
    return await this.delete(url)
      .toPromise()
      .then((result) => {
        if (isWithModalMessasge) {
          this.openModal('Success', 'This action sucessfully to process!');
        }

        return {
          status: true,
          msg: result,
        };
      })
      .catch((err) => {
        if (isWithModalMessasge) {
          this.openModal(
            'Failed',
            'This action failed to process! ' + (err.error['message'] ? '\n messasge : ' + err.error['message'] : '')
          );
        }
        return {
          status: false,
          msg: err,
        };
      });
  }

  async putApi(url, param, isWithModalMessasge?) {
    return await this.put(url, param)
      .toPromise()
      .then((result) => {
        if (isWithModalMessasge) {
          this.openModal('Success', 'This action sucessfully to process!');
        }

        return {
          status: true,
          msg: result,
        };
      })
      .catch((err) => {
        if (isWithModalMessasge) {
          this.openModal(
            'Failed',
            'This action failed to process! ' + (err.error['message'] ? '\n messasge : ' + err.error['message'] : '')
          );
        }

        return {
          status: false,
          msg: err,
        };
      });
  }

  async loadPostData(url, param) {
    return await this.post(url, param)
      .toPromise()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log(error);
        return undefined;
      });
  }

  async loadGetData(url) {
    return await this.get(url)
      .toPromise()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log(error);
        return undefined;
      });
  }

  openModal(title?, msg?, isFooter?, footerLeftText?, footerRightText?) {
    let modalRef;
    modalRef = this.modalService.open(ModalComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.title = title ? title : '';
    modalRef.componentInstance.msg = msg ? msg : 'Please contact administrator for this issue!';
    modalRef.componentInstance.isFooter = isFooter ? isFooter : false;
    if (footerLeftText && isFooter) {
      modalRef.componentInstance.footerLeftText = footerLeftText ? footerLeftText : 'Yes';
    }
    if (footerRightText && isFooter) {
      modalRef.componentInstance.footerRightText = footerRightText ? footerRightText : 'No';
    }
  }
  postDownload(url, data: any = null): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: this.authToken,
      }),
      responseType: 'blob' as 'json',
    };
    return this.http.post<any[]>(url, data, httpOptions);
  }
}
