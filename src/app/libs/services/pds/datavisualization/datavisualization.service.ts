import { HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rest_api } from 'src/app/libs/configs';
import { ApiService } from '../../common/api.service';

@Injectable()
export class DataVisualizationService {
  invokeRefreshAllChart = new EventEmitter();

  constructor(private apiService: ApiService) {}

  refrechAllChart() {
    this.invokeRefreshAllChart.emit();
  }


  getChartListApi(): Observable<any> {
    return this.apiService.get(rest_api.API_CHART_LIST);
  }

  getDashboardListApi(): Observable<any> {
    return this.apiService.get(rest_api.API_DASHBOARD_LIST);
  }

  // start chart detail api
  getChartDatasourceApi(): Observable<any> {
    return this.apiService.get(rest_api.CHART_DATASOURCE);
  }
  getColorPalleteApi(): Observable<any> {
    return this.apiService.get(rest_api.COLOR_PALLETE);
  }
  getChartExploreApi(url: string, params: any): Observable<any> {
    return this.apiService.get(`${url}?${params}`);
  }
  deleteDashboardApi(id: string): Observable<any> {
    // return harus muncul modal alert
    return this.apiService.delete(`/api/dashboard/delete?id=${id}`);
  }
  deleteChartApi(data: any): Observable<any> {
    // return harus muncul modal alert
    return this.apiService.post(`/api/chart/delete`, data);
  }
  postShareChartApi(data: any): Observable<any> {
    // return harus muncul modal alert
    return this.apiService.post(`/api/chart/getshare/chart`, data);
  }

  postShareUrlChartApi(data: any): Observable<any> {
    // return harus muncul modal alert
    return this.apiService.post(`/api/chart/getshareurl`, data);
  }
  getChartExploreFormDataApi(url: string, data: any): Observable<any> {
    return this.apiService.post(`${url}`, data);
  }
  postDownloadChartApi(url: string, data: any): Observable<any> {
    return this.apiService.postDownload(`${url}`, data);
  }
  // end chart detail api

  // menu builder
  getApplicationListApi(): Observable<any> {
    return this.apiService.get(rest_api.API_APPLICATION_LIST);
  }
  // menu builder
}
