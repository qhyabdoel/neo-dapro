import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { staticfilterDateTypeListComparison, static_cols } from 'src/app/libs/helpers/constant_datavisualization';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';

@Component({
  selector: 'modal-comparison',
  templateUrl: './modal-comparison.component.html',
})
export class ModalComparisonComponent implements OnInit {
  @Input() public chartLinks;
  @Input() public visualType;
  @Output() public form_data;

  public slice: any = {};
  public notifFormulaEditorOpts = {
    language: 'sql',
    automaticLayout: true,
  };
  public filterDateTypeListComparison: any = [];
  public list_cols: any = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalComparisonComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.filterDateTypeListComparison = staticfilterDateTypeListComparison;
    this.list_cols = static_cols;
  }
  closeFormula = () => {
    this.modalService.dismissAll();
  };

  onAddAction = (type) => {
    let duplicateArr = [...this.form_data[type]];
    let object = null;
    if (type === 'comparison') {
      object = setObjectComparison(this.form_data[type].length + 1);
    } else {
      object = setObjectBaseColumn(this.form_data[type].length + 1);
    }
    duplicateArr.push(object);
    this.form_data = { ...this.form_data, [type]: duplicateArr };
  };

  onDeleteAction = (type, index) => {
    let copyArr = [...this.form_data[type]];
    copyArr.splice(index, 1);
    this.form_data = {
      ...this.form_data,
      [type]: copyArr,
    };
  };

  // async saveAndRunQuery() {
  //   this.modalService.dismissAll();
  //   $('button#btn-danger').trigger('click');

  //   let viz_type = this.form_data.viz_type ? this.form_data.viz_type : this.visualType;
  //   if (this.visualType == 'histogram') viz_type = 'histogram';
  //   if (this.visualType == 'osmmap') viz_type = 'histogram';
  //   await this.runQuery(viz_type);
  //   this.cdRef.detectChanges();
  // }

  onChange = (event, type, name, index) => {
    let copyArr = [...this.form_data[type]];
    let obj = copyArr.find((_, i) => i === index);

    if (name === 'filter_date_type') {
      obj = {
        ...obj,
        [name]: event.target.value,
        filters: this.handleOnChangeFlagDateFilterType(event.target.value, obj.column),
      };
    } else if (name === 'static_value') {
      obj = {
        ...obj,
        [name]: moment(event.value).format(),
        filters: this.handleOnChangeFlagDateFilterType(obj.filter_date_type, obj.column, event.value),
      };
    } else {
      obj = {
        ...obj,
        [name]: event.target.value,
      };
    }

    copyArr = copyArr.map((data, i) => {
      if (i === index) {
        data = obj;
      }
      return data;
    });
    this.form_data = {
      ...this.form_data,
      [type]: copyArr,
    };
  };

  handleDateValue = (value) => {
    return moment(value).format();
  };

  handleOnChangeFlagDateFilterType = (type, column, date?) => {
    let filters = [];
    switch (type) {
      case 'date':
      case 'static_date':
        filters.push({
          col: column,
          op: '<=',
          val: moment(date ? date : new Date()).format(),
        });
        break;
      case 'month':
      case 'static_month':
        filters.push(
          {
            col: column,
            op: '>=',
            val: moment(date ? date : new Date())
              .startOf('month')
              .format(),
          },
          {
            col: column,
            op: '<=',
            val: moment(date ? date : new Date())
              .endOf('month')
              .format(),
          }
        );
        break;
      case 'year':
      case 'static_year':
        filters.push(
          {
            col: column,
            op: '>=',
            val: moment(date ? date : new Date())
              .startOf('year')
              .format(),
          },
          {
            col: column,
            op: '<=',
            val: moment(date ? date : new Date())
              .endOf('year')
              .format(),
          }
        );
        break;
      default:
        break;
    }
    return filters;
  };
}

const setObjectComparison = (index) => {
  return {
    key: Number(index),
    name: null,
    label: null,
    formula: null,
  };
};

const setObjectBaseColumn = (index) => {
  return {
    key: Number(index),
    id: null,
    label: null,
    column: null,
    metric: null,
    filter_date_type: null,
    static_value: null,
    filters: [],
  };
};
