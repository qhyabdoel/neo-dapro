import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { lastValueFrom, Observable } from 'rxjs';
import { ApiService, TranslationService, WorkspaceService } from 'src/app/libs/services';
import { QueryCommand } from 'src/app/libs/models';

import queryCommandProperties from 'src/assets/data/dataprocessing/query-cmd-props.json';
import queryCmdBtnCfgs_EN from 'src/assets/data/dataprocessing/query-cmd-cfgs_en.json';
import queryCmdBtnCfgs_ID from 'src/assets/data/dataprocessing/query-cmd-cfgs_id.json';
import { AppState } from 'src/app/libs/store/states';

@Injectable()
export class QueryCommandService {
  private lang: string;

  constructor(
    private store: Store<AppState>,
    private apiService: ApiService,
    private workspaceService: WorkspaceService,
    private translationService: TranslationService
  ) {
    this.lang = this.translationService.getSelectedLanguage();
  }

  getQueryCommands(): any {
    const queryCommands = [];
    const qryCmdKeys = Object.keys(queryCommandProperties);

    qryCmdKeys.forEach((qryCmdKey, i) => {
      const config = this.lang === 'id' ? queryCmdBtnCfgs_ID[qryCmdKey] : queryCmdBtnCfgs_EN[qryCmdKey];

      const queryCommand = new QueryCommand();
      queryCommand.idNum = 100 + i;
      queryCommand.name = qryCmdKey.toLowerCase();

      const newQueryCommand = { ...queryCommand, ...queryCommandProperties[qryCmdKey], ...config };

      queryCommands.push(newQueryCommand);
    });

    return queryCommands;
  }

  getQueryList(params: string): Observable<any> {
    return this.apiService.post('/api/query/list', params);
  }
}
