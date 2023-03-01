import { ApiService } from 'src/app/libs/services';
import { isDateParser } from './helper';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppState } from 'src/app/libs/store/states';
import { Store } from '@ngrx/store';

export class QueryMetadata {
  private datasets: { [key: string]: {} } = {};
  private queryMetadata: { [key: string]: { [key: string]: {} } } = {};

  constructor(private store: Store<AppState>, private apiService: ApiService) {}

  reset() {
    this.datasets = {};
    this.queryMetadata = {};
  }

  getQueryMetadata(queryID: number): Observable<any> {
    return this.apiService.post('/api/query/metadata', { userQueryID: queryID }).pipe(
      map((response) => {
        if (response.code == 200 && response.status == 'success') {
          return response.response;
        }

        return {};
      }),
      tap((data) => {
        this.queryMetadata = data;
      }),
      catchError((err) => {
        return throwError(`Error getQueryMetadate. Err : ${err}`);
      })
    );
  }

  putDataset(datasets: any[]) {
    datasets.forEach((dataset) => {
      if (!this.datasets.hasOwnProperty(dataset.id)) {
        this.datasets[dataset.id] = dataset;
      }
    });
  }

  getMetadataBySourceID(sourceID: string): any[] {
    if (!this.datasets.hasOwnProperty(sourceID)) {
      return null;
    }

    const dataset = this.datasets[sourceID];
    const datasetCols: [] = dataset['columns'];
    const datasetRows: [] = dataset['rows'];
    let queryDatasetMetadata: { [key: string]: {} } = {};
    if (this.queryMetadata.hasOwnProperty(sourceID)) {
      queryDatasetMetadata = this.queryMetadata[sourceID];
    }

    let result = [];
    datasetCols.forEach((colName, colIdx) => {
      if (queryDatasetMetadata.hasOwnProperty(colName)) {
        const colMetadata = queryDatasetMetadata[colName];
        result.push({
          label: colName,
          aggregate: colMetadata['avg'],
          filterable: colMetadata['filterable'],
          groupable: colMetadata['groupby'],
          datetime: colMetadata['is_dttm'],
          indexable: colMetadata['indexable'],
          fast_index: colMetadata['fast_index'],
        });
      } else {
        let isNumber = false;
        let isUTC = false;
        for (let rowID = 0; rowID < datasetRows.length && rowID < 10; rowID++) {
          const element = datasetRows[rowID][colIdx];
          if (typeof element === 'boolean' || typeof element === 'object' || Array.isArray(element)) {
            isNumber = false;
            isUTC = false;
            break;
          }

          if (isNumber && isNaN(element)) {
            isNumber = false;
            isUTC = false;
            break;
          }

          if (isUTC) {
            if (element == null || isDateParser(element)) {
              continue;
            }
            isNumber = false;
            isUTC = false;
            break;
          }

          if (!isNaN(element)) {
            isNumber = true;
          } else if (isDateParser(element)) {
            isUTC = true;
          }
        }

        result.push({
          label: colName,
          aggregate: isNumber,
          filterable: !isNumber,
          groupable: !isNumber,
          datetime: isUTC,
          indexable: false,
          fast_index: false,
        });
      }
    });

    return result;
  }
}
