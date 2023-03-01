import { Quid } from "./quid.model";
import { BaseBackendResponse } from './base.model';

export interface DatasetRequest {
  quid: string;
  size: number;
  userQueryID: number;
}

export interface Datasets {
  readonly columns: string[];
  readonly rows: string[][];
  readonly source: string;
}

export interface DatasetWithQuid {
  readonly total: { [key: string]: number; };
  readonly datasets: { [key: string]: Datasets; };
  readonly quid: Quid;
}

export interface DatasetResponse extends BaseBackendResponse {
  readonly response: DatasetWithQuid;
}
