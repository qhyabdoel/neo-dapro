import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/libs/services';


@Component({
  selector: 'modal-view-query-information',
  templateUrl: './modal-query-information.component.html',
})
export class ModalViewQueryInformationComponent {
  @Output() onClose = new EventEmitter<any>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  public queryQuid: string;

  dataSource: MatTableDataSource<{
    no: number
    statement: string
    input: { [key: string]: any }
    output: { [key: string]: any }
  }>;
  summary: { [key: string]: any } | undefined = undefined
  loading: boolean = true

  columnToDisplay = ["no", "statement", "input", "output"]

  constructor(
    private _apicall: ApiService,
  ) { }

  async ngOnInit() {
    let { result: { response: { pipes, sourceRowCount } } } = await this._apicall.postApi("/api/dataset/status", { quid: this.queryQuid }, false);
    pipes = pipes || [];
    this.loading = false
    this.dataSource = new MatTableDataSource(pipes.map((x, i) => ({
      no: i + 1,
      statement: x.query_string,
      input: x.input,
      output: x.output
    })));
    this.summary = sourceRowCount;
    this.dataSource.sort = null;
    this.dataSource.paginator = null;
  }

  _onClose() {
    this.onClose.emit();
  }
}
