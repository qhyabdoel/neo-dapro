export interface Quid {
  quid: string;
  done: boolean;
  elapsed: number;
  createdDate: Date;
  updatedDate: Date;
  markDelete: boolean;
  userQueryID: number;
  source: string[];
  sourceRowCount: { [key: string]: number; };
  state: string;
  message: string;
  rowtotal: number;
}
