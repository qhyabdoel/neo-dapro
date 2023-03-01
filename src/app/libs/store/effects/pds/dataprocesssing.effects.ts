import { Injectable } from '@angular/core';
import { mergeMap, map, delay, withLatestFrom, expand, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import {
  AddQueryCommandItemEndpoint,
  AddQueryCommandItemEndpointActual,
  ExecuteQuery,
  ExecuteQueryFailed,
  ExecuteQuerySucceed,
  GetQueryCommands,
  GetQueryCommandsFailed,
  GetQueryCommandsSucceed,
  GetQueryMetadata,
  GetQueryMetadataFailed,
  GetQueryMetadataSucceed,
  GetQueryResult,
  GetQueryResultFailed,
  GetQueryResultSucceed,
  ResetMetadata,
  ResetWorkspace,
  ResetWorkspaceDoUpdate,
  SetActiveTable,
  SetIsDatasetListReloadRequestTriggered,
  SetIsQueryRequestFailed,
  SetIsWorkspaceResetIsTriggered,
  SetMetadata,
  SetPqlString,
  SetQueryObject,
  SetToastrMessage,
  UpdateMetadata,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { AppState } from 'src/app/libs/store/states';
import { ApiService, QueryCommandService, TranslationService, WorkspaceService } from 'src/app/libs/services';
import { queryObjectSelector, queryResultSelector } from '../../selectors/dataprocessing.selectors';
import { getTextCollections } from 'src/app/libs/helpers/data-processing.helper';
import { EMPTY, from } from 'rxjs';
import { isDateParser } from 'src/app/pages/pds/dataprocessing/helper';

@Injectable()
export class DataProcessingEffects {
  getQueryCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetQueryCommands),
      map(() => {
        const queryCommands = this.queryCommandService.getQueryCommands();

        if (queryCommands) {
          return GetQueryCommandsSucceed({ queryCommands: queryCommands });
        }

        return GetQueryCommandsFailed();
      })
    )
  );

  executeQuery$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExecuteQuery),
      mergeMap((props) => from(this.workspaceService.executeQuery(props.title, props.isPreview))),
      map((result) => {
        if (result && result.status === 'success') {
          return ExecuteQuerySucceed();
        }

        return ExecuteQueryFailed();
      })
    );
  });

  executeQuerySucceed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExecuteQuerySucceed),
      delay(1000),
      withLatestFrom(this.store$.select(queryObjectSelector)),
      mergeMap(([, queryObject]) => {
        // console.log('executeQuerySucceed$ - queryObject', queryObject);
        return [
          GetQueryResult({ quid: queryObject.quid, userQueryID: queryObject.ID, size: 25 })
        ];
      })
    )
  );

  executeQueryFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExecuteQueryFailed),
      map(() => SetIsQueryRequestFailed({ isQueryRequestFailed: true }))
    )
  );

  getQueryResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetQueryResult),
      mergeMap((props) => {
        // console.log('getQueryResult$ - props', props);
        const request$ = this.apiService.post('/api/dataset/view', props);
        return request$
          .pipe(
            expand(result => {
              const { response: { quid: { done, state } } } = result;
              if (state === "error") {
                return EMPTY;
              }
              if (!done) {
                return request$;
              }
              return EMPTY;
            })
          )
      }),
      mergeMap((result: ApiResult) => {
        // console.log('getQueryResult$ - result', result);
        if (result.status === 'success') {
          const { response: { quid: { done }, datasets } } = result;
          return [
            GetQueryResultSucceed({ queryResult: result.response, needReloadDatasetList: done === true, needMetadata: done === true }),
            SetActiveTable({ activeTable: Object.keys(datasets)[0] })
          ];
        }
        return [GetQueryResultFailed()];
      }),
    )
  );

  getQueryMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetQueryMetadata),
      mergeMap(props => this.apiService.post('/api/query/metadata', props)),
      map((result: ApiResult) => {
        if (result && result.status === 'success') {
          const metadatas = [];

          const datasetKeys = Object.keys(result.response);
          datasetKeys.forEach((datasetKey) => {
            const columnKeys = Object.keys(result.response[datasetKey]);

            const datasetMeta = {
              dataset: datasetKey,
              columns: [],
            } as MetadataDatasetWrapper;

            columnKeys.forEach((columnKey) => {
              const metadata = result.response[datasetKey][columnKey];

              const columnMeta = {
                columnName: columnKey,
                metadata,
              } as MetadataColumnWrapper;

              datasetMeta.columns.push(columnMeta);
            });

            metadatas.push(datasetMeta);
          });
          return GetQueryMetadataSucceed({ metadatas });
        }

        return GetQueryMetadataFailed();
      })
    )
  );

  getQueryMetadataSucceed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetQueryMetadataSucceed),
      mergeMap((value) => {
        let setMetadatas = [];
        const { metadatas } = value;
        for (const md of metadatas) {
          const { dataset } = md;
          for (const col of md.columns) {
            const { columnName, metadata } = col;
            setMetadatas.push(UpdateMetadata({ dataset, columnName, metadata }));
          }
        }
        return setMetadatas
      })
    )
  );

  getQueryResultSucceed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetQueryResultSucceed),
      mergeMap((value) => {
        this.store$.dispatch(ResetMetadata());
        const { queryResult, needReloadDatasetList, needMetadata } = value;
        const nextActions: Action[] = [
          SetIsDatasetListReloadRequestTriggered({ isDatasetListReloadRequestTriggered: needReloadDatasetList }),
        ]

        if (needMetadata) {
          for (let dataset in queryResult.datasets) {
            const columns = queryResult.datasets[dataset].columns;
            const rows = queryResult.datasets[dataset].rows;
            if (!rows) {
              continue;
            }

            columns.forEach((columnName, i) => {
              const metadata = {
                groupby: true,
                filterable: true,
                is_dttm: false,
                avg: false,
                min: false,
                max: false,
                sum: false,
                indexable: false,
                fast_index: false,
              };

              let isNumber = false;
              let isUTC = false;

              for (let j = 0; j < rows.length && j < 10; j++) {
                const cell = rows[j][i];
                if (typeof cell === "boolean" || typeof cell === "object" || Array.isArray(cell)) {
                  isNumber = false;
                  isUTC = false;
                  break;
                }

                if (isNumber && isNaN(cell)) {
                  isNumber = false;
                  isUTC = false;
                  break;
                }

                if (isUTC) {
                  if (cell == null || isDateParser(cell)) {
                    continue;
                  }
                  isNumber = false;
                  isUTC = false;
                  break;
                }

                if (!isNaN(cell)) {
                  isNumber = true;
                } else if (isDateParser(cell)) {
                  isUTC = true;
                } else {
                  isNumber = false;
                  isUTC = false;
                  break;
                }
              }

              metadata.avg = isNumber;
              metadata.sum = isNumber;
              metadata.max = isNumber;
              metadata.min = isNumber;
              metadata.filterable = !isNumber;
              metadata.groupby = !isNumber;
              metadata.is_dttm = isUTC;

              this.store$.dispatch(SetMetadata({ dataset, columnName, metadata }));
            });
          }
          nextActions.push(GetQueryMetadata({ quid: value.queryResult.quid.quid, userQueryID: value.queryResult.quid.userQueryID }))
        }
        return nextActions;
      })
    )
  );

  resetWorkspace$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResetWorkspace),
      delay(1000),
      map((props) => {
        if (props.needToastr) {
          this.store$.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'info',
                message: this.textCollections.DATA_PROCESSING.QCIRS,
              },
            })
          );
        }

        return ResetWorkspaceDoUpdate();
      })
    )
  );

  resetWorkspaceDoUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResetWorkspaceDoUpdate),
      map((props) => {
        return SetIsWorkspaceResetIsTriggered({ isWorkspaceResetIsTriggered: false });
      })
    )
  );

  addQueryCommandItemEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AddQueryCommandItemEndpoint),
      delay(500),
      map((props: any) => (AddQueryCommandItemEndpointActual({ itemEndpoint: props.itemEndpoint })))
    )
  );

  private lang: string;
  private textCollections: any;

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,

    private apiService: ApiService,
    private queryCommandService: QueryCommandService,
    private translationService: TranslationService,
    private workspaceService: WorkspaceService
  ) {
    this.lang = this.translationService.getSelectedLanguage();
    this.textCollections = getTextCollections(this.lang);
  }
}
