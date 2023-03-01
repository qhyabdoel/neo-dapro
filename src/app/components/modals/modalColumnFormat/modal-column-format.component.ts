import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  staticcolumnFormatList,
  static_table_timestamp_format,
  static_y_axis_format,
} from 'src/app/libs/helpers/constant_datavisualization';

@Component({
  selector: 'modal-column-format',
  templateUrl: './modal-column-format.component.html',
})
export class ModalCustomColumnFormatComponent implements OnInit {
  @Input() public visualType;
  // @Input() public list_table_timestamp_format;
  // @Input() public list_y_axis_format;
  // @Input() public chartLinks;
  @Input() public data_exploreJson;
  // function
  @Output() runQuery: (any) => void;
  @Output() public form_data;

  columnFormatList: any = [];
  table_selected_column: any = [];
  list_table_timestamp_format: Array<any> = static_table_timestamp_format;
  list_y_axis_format: Array<any> = static_y_axis_format;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalCustomColumnFormatComponent>,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {
    this.columnFormatList = staticcolumnFormatList;
    this.table_selected_column = [];
    let viz_type = this.form_data.viz_type;
    if (viz_type === 'table') {
      if (this.form_data.all_columns.length > 0) {
        this.table_selected_column = this.form_data.all_columns;
      } else {
        if (this.form_data.groupby.length > 0) {
          for (let i = 0; i < this.form_data.groupby.length; i++) {
            this.table_selected_column.push(this.form_data.groupby[i]);
          }
        }
        if (this.form_data.metrics.length > 0) {
          for (let i = 0; i < this.form_data.metrics.length; i++) {
            this.table_selected_column.push(this.form_data.metrics[i]);
          }
        }
      }
      this.table_selected_column = this.table_selected_column.map((s) => [s, s]);
    } else {
      for (let i = 0; i < this.form_data.groupby.length; i++) {
        this.table_selected_column.push([this.form_data.groupby[i], this.form_data.groupby[i]]);
      }
      for (let i = 0; i < this.form_data.base_columns.length; i++) {
        this.table_selected_column.push([this.form_data.base_columns[i].id, this.form_data.base_columns[i].label]);
      }
      for (let i = 0; i < this.form_data.comparison.length; i++) {
        this.table_selected_column.push([this.form_data.comparison[i].id, this.form_data.comparison[i].label]);
      }
    }

    if (this.form_data.custom_column_format_arr == undefined || this.form_data.custom_column_format_arr.length == 0) {
      for (let i = 0; i < 1; i++) {
        let duplicateArr = [...this.form_data.custom_column_format_arr];
        duplicateArr.push({
          column: '',
          format_type: '',
          format: '',
        });
        this.form_data = { ...this.form_data, custom_column_format_arr: duplicateArr };
      }
    }
  };
  closeFormula = () => {
    this.modalService.dismissAll();
  };
  onAddColumnFormat() {
    let copyArr = [...this.form_data.custom_column_format_arr];
    copyArr.push({
      column: '',
      format_type: '',
      format: '',
    });
    this.form_data = { ...this.form_data, custom_column_format_arr: copyArr };
    this.cdRef.detectChanges();
    return;
  }

  onDelColumnFormat(index) {
    let copyArr = [...this.form_data.custom_column_format_arr];
    copyArr.splice(index, 1);
    this.form_data = {
      ...this.form_data,
      custom_column_format_arr: copyArr,
    };
  }

  async saveAndRunQuery() {
    this.activeModal.close(this.form_data.custom_column_format_arr);
  }

  onChange = (index, event, name) => {
    let copyArr = [...this.form_data.custom_column_format_arr];
    let obj = copyArr.find((_, i) => i === index);
    obj = {
      ...obj,
      [name]: event.target.value,
    };
    copyArr = copyArr.map((data, i) => {
      if (i === index) {
        data = obj;
      }
      return data;
    });
    this.form_data = {
      ...this.form_data,
      custom_column_format_arr: copyArr,
    };
  };
}
