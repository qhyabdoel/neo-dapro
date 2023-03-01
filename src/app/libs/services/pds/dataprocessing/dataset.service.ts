import { Injectable } from '@angular/core';
import { ApiService } from '../../common/api.service';

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  constructor(private apiService: ApiService) {}

  list(params: any): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      this.apiService.post('/api/query/list', params).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });
  }

  delete(params: any): Promise<ApiResult> {
    return new Promise((resolve, reject) => {
      this.apiService.post('/api/query/delete', params).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });
  }
}
