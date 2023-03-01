import { Injectable } from '@angular/core';
import { ApiService } from '../../common/api.service';

import { TreeviewItem } from 'ngx-treeview';
import { EMPTY, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatasourceService {
  constructor(private apiService: ApiService) {}

  list(path: string, filter?: string): Observable<ApiResult> {
    if (filter && filter !== '') {
      return this.apiService.get(`${environment.api_paths.explorerSearchV2}?path=${path}&term=${filter ? filter : ''}`);
    } else {
      return this.apiService.get(`${environment.api_paths.explorerListV2}?path=${path}`);
    }
  }

  listConnection(type: string, name?: string, path?: string): Observable<ApiResult> {
    if (type === 'hdfs') {
      if (name) {
        let connectionPath = path || "/";
        return this.apiService.get(`${environment.api_paths.exploreHdfsConnection}/${name}/list?path=${connectionPath}`);
      }
      return this.apiService.get(environment.api_paths.exploreHdfsConnection);
    }
  }

  check(path, fileName): Observable<ApiResult> {
    if (!path) {
      path = '√:';
    }
    // console.log('path', path);
    return this.apiService.post(environment.api_paths.explorerCheck, { paths: [`${path}/${fileName}`] });
  }

  copy(srcFile, dstFile): Observable<ApiResult> {
    const params = {
      src: [srcFile],
      dst: [dstFile],
    };
    return this.apiService.post(environment.api_paths.explorerCp, params);
  }

  create(path, fileName): Observable<ApiResult> {
    const params: any = {
      path: `${path}`,
      name: `${fileName}`,
    };
    return this.apiService.post(environment.api_paths.explorerDirV2, params);
  }

  move(srcFile, dstFile): Observable<ApiResult> {
    const params = {
      src: [srcFile],
      dst: [dstFile],
    };
    return this.apiService.post(environment.api_paths.explorerMvV2, params);
  }

  remove(isFile: boolean, params: any): Observable<ApiResult> {
    let urlPath = '';

    if (!isFile) {
      urlPath = environment.api_paths.queryDelete;
    }

    if (isFile) {
      urlPath = environment.api_paths.explorerRm;
    }

    return this.apiService.post(urlPath, params);
  }

  upload(urlPath: string, path: string, files: File[], params?: any): Observable<ApiResult> {
    if (!path) {
      path = '√:';
    }
    const formData: FormData = new FormData();
    formData.append('path', path);

    for (let i = 0; i < files.length; i++) {
      var validateFileName = files[i].name;
      formData.append(`files-` + i, files[i], validateFileName);
    }

    if (params && typeof params === 'object') {
      for (var property in params) {
        if (params.hasOwnProperty(property)) {
          formData.append(property, params[property]);
        }
      }
    }

    return this.apiService.post(urlPath, formData);
  }

  download(item: TreeviewItem): Observable<ApiResult> {
    let url = item.value.isDir ? '/api/explorer/dl/dir' : '/api/explorer/dl';
    return this.apiService.post(url, { path: `${item.value.location}/${item.value.name}` }, { responseType: 'blob' });
  }
}
