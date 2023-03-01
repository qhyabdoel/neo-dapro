import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { staticcolumn_width_arr } from 'src/app/libs/helpers/constant_datavisualization';

@Component({
  selector: 'modal-column-width-setting',
  templateUrl: './modal-column-width-setting.component.html',
})
export class ModalColumnWidthSettingComponent implements OnInit {
  @Input() public visualType;

  @Output() runQuery: (any) => void;
  @Output() public form_data;

  column_width_arr: any = [];
  table_selected_column_width: any = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalColumnWidthSettingComponent>,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.initial();
  }

  // yang dipake

  initial = () => {
    this.column_width_arr = staticcolumn_width_arr;
    this.table_selected_column_width = [];
    if (this.form_data.all_columns.length > 0) {
      for (let i = 0; i < this.form_data.all_columns.length; i++) {
        this.table_selected_column_width.push(this.form_data.all_columns[i]);
      }
    } else {
      if (this.form_data.groupby.length > 0) {
        for (let i = 0; i < this.form_data.groupby.length; i++) {
          this.table_selected_column_width.push(this.form_data.groupby[i]);
        }
      }
      if (this.form_data.metrics.length > 0) {
        for (let i = 0; i < this.form_data.metrics.length; i++) {
          this.table_selected_column_width.push(this.form_data.metrics[i]);
        }
      }
    }
    if (this.form_data.static_number) this.table_selected_column_width.unshift('No');
    this.table_selected_column_width = this.table_selected_column_width.map((s) => [s, s]);
    if (this.form_data.custom_width_column_arr == undefined || this.form_data.custom_width_column_arr.length == 0) {
      for (let i = 0; i < 1; i++) {
        let duplicateArr = [...this.form_data.custom_width_column_arr];
        duplicateArr.push({
          column: '',
          width: '',
        });
        this.form_data = { ...this.form_data, custom_width_column_arr: duplicateArr };
      }
    }
  };
  closeFormula = () => {
    this.modalService.dismissAll();
  };
  onAddColumnWidth() {
    let copyArr = [...this.form_data.custom_width_column_arr];
    copyArr.push({
      column: '',
      width: '',
    });
    this.form_data = {
      ...this.form_data,
      custom_width_column_arr: copyArr,
    };
  }

  onDelWidth(index) {
    let copyArr = [...this.form_data.custom_width_column_arr];
    copyArr.splice(index, 1);
    this.form_data = {
      ...this.form_data,
      custom_width_column_arr: copyArr,
    };
  }
  async saveAndRunQuery() {
    this.activeModal.close(this.form_data.custom_width_column_arr);
  }
  onChange = (index, event, name) => {
    let copyArr = [...this.form_data.custom_width_column_arr];
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
      custom_width_column_arr: copyArr,
    };
  };
}
